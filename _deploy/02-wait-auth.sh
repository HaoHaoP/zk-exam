#!/bin/bash
# 轮询 GitHub 设备授权，拿到 token 后写入临时文件并配置 gh。
# 安全：绝不把 token 打印到 stdout，只输出掩码信息。
set -u
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890

DEVICE_CODE=$(python3 -c "import json;print(json.load(open('/tmp/gh_device.json'))['device_code'])")
TOKFILE=/tmp/.gh_zk_token
INTERVAL=5
DEADLINE=$(( $(date +%s) + 890 ))

echo "开始轮询授权状态（最多等 890 秒）…"
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  curl -sS --max-time 25 -X POST https://github.com/login/oauth/access_token \
    -H "Accept: application/json" \
    -d "client_id=178c6fc778ccc68e1d6a" \
    -d "device_code=${DEVICE_CODE}" \
    -d "grant_type=urn:ietf:params:oauth:grant-type:device_code" \
    -o /tmp/gh_token_resp.json 2>/dev/null

  ERR=$(python3 -c "
import json
try:
    d=json.load(open('/tmp/gh_token_resp.json'))
except Exception:
    print('parse_error'); raise SystemExit
print(d.get('error',''))
" 2>/dev/null)

  if [ -z "$ERR" ]; then
    # 成功：把 token 写进文件（权限 600），不打印内容
    python3 -c "
import json,os
d=json.load(open('/tmp/gh_token_resp.json'))
t=d.get('access_token','')
if not t: raise SystemExit('no_token')
fd=os.open('/tmp/.gh_zk_token', os.O_WRONLY|os.O_CREAT|os.O_TRUNC, 0o600)
os.write(fd, t.encode()); os.close(fd)
print('TOKEN_MASKED=' + t[:4] + '****' + t[-4:] + '  len=' + str(len(t)))
"
    if [ -f "$TOKFILE" ]; then
      echo "✓ 授权成功，凭据已落盘（权限 600）"
      echo "── 配置 gh CLI ──"
      gh auth login --hostname github.com --git-protocol https --with-token < "$TOKFILE" && echo "gh 配置完成"
      echo "── gh auth status ──"
      gh auth status 2>&1 | sed -e 's/gho_[A-Za-z0-9_]*/gho_***REDACTED***/g' -e 's/ghp_[A-Za-z0-9_]*/ghp_***REDACTED***/g'
      echo
      echo "── git 凭据助手（让 git push 也能用）──"
      git config --global credential.helper osxkeychain
      printf "protocol=https\nhost=github.com\nusername=x-access-token\npassword=%s\n\n" "$(cat "$TOKFILE")" \
        | git credential-osxkeychain store 2>/dev/null && echo "已存入钥匙串（不再需要令牌）"
      rm -f "$TOKFILE" /tmp/gh_token_resp.json
      echo "临时 token 文件已删除"
      echo "ALL_DONE"
      exit 0
    fi
  fi

  case "$ERR" in
    authorization_pending) : ;;
    slow_down) INTERVAL=$((INTERVAL+5)) ;;
    expired_token) echo "✗ 验证码已过期，需要重新发起"; exit 2 ;;
    access_denied) echo "✗ 你在浏览器里点了拒绝"; exit 3 ;;
    *) echo "轮询返回：$ERR" ;;
  esac
  sleep "$INTERVAL"
done
echo "✗ 等待超时（15 分钟未授权），需要重新发起"
exit 4
