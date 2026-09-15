# 阶段 8 · 上线记录与最后一步

更新时间：2026-09-15

## 已完成（Agent 执行，均已实测）

| 项目 | 值 |
|------|-----|
| GitHub 仓库 | https://github.com/HaoHaoP/zk-exam （PUBLIC） |
| 最新提交 | `af774f6` chore: 忽略 Vercel 本地环境文件，加入部署登录脚本 |
| 首个提交 | `2754d7b` feat: 自考 02325/04741 近三年大题精练 |
| Vercel 团队 | haohaops-projects |
| Vercel 项目 | zk-exam |
| 生产地址 | https://zk-exam.vercel.app |
| 部署实例 | https://zk-exam-d9ixmutrf-haohaops-projects.vercel.app |
| Git 集成 | 已连接 GitHub 仓库，push 即自动部署 |
| 自定义域名 | zk.haohaop.com（已加入项目，等待 DNS） |

## 线上验证结果（实测）

| 检查项 | 结果 |
|--------|------|
| 首页 `/` | HTTP 200，标题「自考大题精练 · 02325 / 04741」 |
| SPA 深链 `/topics` | HTTP 200（vercel.json 回退生效） |
| 原卷 PDF `/papers/02325-202504-题目.pdf` | HTTP 200，1634345 字节，`application/pdf` |
| 缓存头 | `public, max-age=31536000, immutable`（按 vercel.json 生效） |
| `/manifest.json` | HTTP 200 |
| `/favicon.svg` | HTTP 200 |

## 安全问题检查

Vercel `link` 时生成了 `.env.local`（含 `VERCEL_OIDC_TOKEN`）。
已确认：`.gitignore` 中 `.env*` 规则覆盖该文件，`git ls-files` 查无此文件，**未进入版本库、未推送到 GitHub**。

## ⬇ 只剩最后一步：加 DNS 记录（需你操作）

域名 `haohaop.com` 的 DNS 在 **阿里云云解析**（NS：`dns9/dns10.hichina.com`）。
Vercel 提示的 Cloudflare NS 是误报，以实际 NS 为准。

**要添加的记录**

| 字段 | 值 |
|------|-----|
| 记录类型 | `CNAME` |
| 主机记录 | `zk` |
| 记录值 | `885c27f1979fd1cf.vercel-dns-017.com` |
| 解析线路 | 默认 |
| TTL | 默认（10 分钟） |

**阿里云操作路径**

阿里云控制台 → 域名 → 域名列表 → `haohaop.com` → 解析设置 → 添加记录 → 按上表填写 → 确定

**参考**：你现有的 `rcti.haohaop.com` 用的就是同款记录（值形如 `119b42b3e7c947b1.vercel-dns-017.com`），所以这条路已验证可行。

## 加完记录之后

1. 等 1–10 分钟（阿里云 SOA 最小 TTL 600 秒）
2. 我执行 `vercel domains verify zk.haohaop.com` 确认状态转为正常
3. Vercel 会自动签发 HTTPS 证书（通常几分钟内）
4. 实测 `https://zk.haohaop.com` 可访问、原卷 PDF 可下载

## 已知限制与说明

- `haohao.com`（无 p）已被另一套 Vercel 上下文认领，当前账号无法绑定其子域，故改用 `haohaop.com`。
- 根域 `haohaop.com` 本身未作任何改动；现有 `ai.` / `gemini.` / `rcti.` / `badge.haohaop.com` 四个站点均未受影响。
- 若 Vercel 在 DNS 生效后仍提示 Ownership 未验证，需要补一条 TXT 记录，届时我会从 `vercel domains verify` 取回具体值。
