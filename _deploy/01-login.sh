#!/bin/bash
# 一次性登录脚本：GitHub (gh) + Vercel
# 用法：bash ~/Documents/自考/zk-exam/_deploy/01-login.sh
# 只需按提示回答，不要把你的 token 发给任何人（包括 AI）

set -u

echo "════════════════════════════════════════════"
echo " 阶段 8 · 第一步：登录 GitHub 与 Vercel"
echo "════════════════════════════════════════════"
echo

# 挂代理（你的 Clash Verge）
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890
echo "已设置代理 127.0.0.1:7890"
echo

echo "── 连通性自检 ──"
curl -sS --max-time 15 -o /dev/null -w "  github.com  HTTP %{http_code}\n" https://github.com/ || true
curl -sS --max-time 15 -o /dev/null -w "  vercel.com  HTTP %{http_code}\n" https://vercel.com/ || true
echo

echo "════════════════════════════════════════════"
echo " [1/2] GitHub 登录"
echo "════════════════════════════════════════════"
echo "接下来会依次问你（按下面的答案选）："
echo "  ① Authenticate Git with your GitHub credentials?  → 直接回车（默认 Y）"
echo "  ② 出现一次性验证码后，按回车会自动打开浏览器"
echo "  ③ 浏览器里粘贴验证码 → Authorize"
echo
read -r -p "准备好了按回车开始 gh 登录… " _

gh auth login || { echo; echo "gh 登录未完成，可重跑本脚本。"; exit 1; }

echo
echo "── GitHub 登录结果 ──"
gh auth status
echo

echo "════════════════════════════════════════════"
echo " [2/2] Vercel 登录"
echo "════════════════════════════════════════════"
echo "选 Continue with GitHub（或邮箱），按回车会自动打开浏览器授权。"
echo
read -r -p "准备好了按回车开始 vercel 登录… " _

vercel login || { echo; echo "vercel 登录未完成，可重跑本脚本。"; exit 1; }

echo
echo "── Vercel 登录结果 ──"
vercel whoami
echo
echo "════════════════════════════════════════════"
echo " 两个都登录成功后，回到对话里说一句「登录好了」"
echo "════════════════════════════════════════════"
