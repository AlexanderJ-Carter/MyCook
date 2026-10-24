# Changelog

## Unreleased

### Fixed
- 钉死 `vite@6.4.5`：`overrides.vite: ">=6.4.5"` 会解析到 Vite 8/Rolldown，主题 CSS 不写入 HTML，cook 首页裸版
- CI 校验 `index.html` 必须包含 `/assets/theme.*.css`
- Recipe JSON-LD 补上 Google 必填 `image`（正文图优先，否则 banner），并收紧菜谱页判定
- 构建期 `transformHead` 写入 Recipe JSON-LD（含必填 image），无 JS 爬虫也能读到

## Unreleased

### Fixed
- **菜谱索引 192 个坏链**：HowToCook「文件夹名=菜名」的菜曾折叠成 4 段链接（线上 301→404），统一改为与真实路由一致的 5 段；MCP 仍兼容旧 4 段路径（自动展开到镜像/索引）
- /ask 限流改信 `X-Real-IP`（XFF 从右取段），伪造 `X-Forwarded-For` 不再绕过 30 次/小时限流；限流桶加周期清扫与上限
- /ask 超大请求回 413 而非掐断连接；客户端中断不再挂死请求
- SW 运行时缓存 activate 时按 `Date` 头做 14 天 TTL 清理；断网时 live JSON 回退缓存而非抛错；CI 部署时缓存名自动注入 commit 短哈希，不再手 bump
- Omni 调用失败不再静默：日志 + `/health` 新增 `omniDetail`（上次成功时间/最近失败原因）
- 厨助手 FAB 与返回顶部按钮重叠：面板展开时自动避让
- 深色模式下「AI 整理 / 站内检索」徽标对比度失效，改用主题令牌
- 厨助手/RecipeToolbar 面板全量接入 i18n（英文站不再夹中文）；英文首页补「问厨助手」入口
- SiteEdition 完整站玉色标识生效（曾因 fallback 变量恒定义而失效）
- 按食材反查曾只认 9 个硬编码词（pantry 对象匹配 bug），统一走共享食材别名表（西红柿/洋芋/卷心菜…）
- GET/DELETE /mcp 与 POST 共用 JSON-RPC 错误形状；recipes-index 资源描述如实标注「前 50 条样例」
- PR 检查语法清单改通配，新文件不再漏检

### Added
- 收藏导出 / 导入（JSON），换设备可迁移
- 快捷键 `A` 打开厨助手（并入快捷键帮助面板）
- 厨助手对话存 sessionStorage，跳转菜谱后返回不丢上下文；Esc 关闭 + 焦点回退 + window 级监听

### Performance
- `docs:build` 由 `scripts/build.mjs` 编排：图片构建与索引生成并行
- `generate` 阶段 agent 发现与集成数据并行；markdown 镜像按 mtime 跳过重写（全量 → 秒级）
- 线上索引对比改内置 fetch + 1 小时缓存；`docs:dev` 跳过线上拉取（曾阻塞最长 20 秒）
- CI 上游仓库缓存（fetch+reset 增量更新），每日 cron 不再从零 clone
- `write-image-manifest` 不再整树扫描两遍

## 1.8.3 — 2026-10-08

### Docs / ops
- MCP.md 与 `.env.example` 对齐厨助手 Omni（OMNI_*）与 SITE_URL=Pages
- lite `docs:build:fast` 写入 howtocook-images 占位跳转页
- `dns/README.md` 说明 cook / mycook / cook-mcp 解析分工

## 1.8.2 — 2026-10-08

### Fixed
- 厨助手检索支持「番茄炒蛋→西红柿炒鸡蛋」等别名，技巧题能命中油温等文
- Omni 在有正文摘录时做真 AI 概括；回复标明「AI 整理 / 站内检索」
- 首页区分 cook（CDN）与 mycook（完整站+图片）

## 1.8.1 — 2026-10-08

### Fixed
- 「刚同步的新菜」不再混入星级页 / 技巧；索引与统计只计真实菜谱
- 厨助手跳转中文菜谱路径时改为硬导航，避免 SPA 只改 URL 不换页
- 随机推荐与 /ask 导航路径收紧到菜谱 / 技巧
- Service Worker 不再预缓存 recent/recipes JSON，并升到 cache-v8
- MCP 规范化嵌套菜谱路径，避免 .../菜名/菜名 双段

## v1.8.0 — 2026-10-07

### 厨助手

- 站内右下角 **厨助手** FAB（类 Folio「问站」）：对话、建议 chip、跳转菜谱
- MCP sidecar 公开 `POST /ask`（限流 + CORS）：先检索菜谱/食材/技巧，可选 OmniRoute 润色
- 首页主 CTA 改为「问厨助手」；窑火杂志风格面板与动效

### 内容

- 同步 HowToCook / CookLikeHOC 上游菜谱；CookLikeHOC README 补回 MyCook 导流

---

## v1.7.0 — 2026-08-15

### Agent / MCP

- **长驻 sidecar 健壮性**：`mcp-tools` 的 JSON 缓存按文件 mtime 失效，重新生成数据后无需重启即可生效
- **OIDC 元数据代理**：`/.well-known/oauth-authorization-server` 加 5s 超时 + 60s 缓存，issuer 变慢/不可达不再拖垮鉴权链路
- **会话生命周期**：新增 `DELETE /mcp` 规范终结会话；空闲 30min 会话轮询回收，防客户端崩溃后内存泄漏

### 文档

- **西班牙语 README**：合并社区贡献 `README.es-ES.md`（#8，by [WebBrain](https://github.com/webbrain-one)）并刷新到与当前主 README 一致（脚本/版本/特性/镜像/贡献者）
- **README**：新增语言切换链接与「贡献者」名单
- **CONTRIBUTING**：新增「翻译与国际化」指南；修复发版步骤中重复的 `git tag` 步骤
- **CODE_OF_CONDUCT**：升级到 [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct.html)（原 v1.4）
- **SECURITY**：补 MCP sidecar 鉴权安全说明；修正「不含后端服务」的失真描述

### 修复

- `generate-sitemap` 的 `BASE_URL` 优先读 `SITE_URL` / `dist/CNAME`，修复 Fork 部署的 sitemap 仍指向原站域名
- `MealPlanner` 菜谱选择弹窗支持 `Esc` 与点击遮罩关闭

---

## v1.6.1 — 2026-08-08

### 体验

- 首页滚动渐显不再导致首屏空白（视口内立即显现 + 2s 兜底）
- 友好 404 与文档页版式；MCP 根路径说明页（不再裸 404）
- Pages 未带图片版时跳转完整站 `mycook`，避免空白占位

### 部署

- **完整镜像默认随 tag 构建**：push `v*` 同时推送 `mycook:full`（含 howtocook-images）与 lite / MCP
- **`deploy/cloud`**：服务器拉 GHCR full 站 + MCP，nginx 示例、定时 `update.sh`（只保留当前镜像）
- **MCP HTTP 鉴权**：Pocket ID JWT（OIDC）或 `MCP_API_KEYS`；暴露 OAuth protected-resource metadata

### 域名

| 域名 | 角色 |
|------|------|
| `cook.alexander.xin` | GitHub Pages 主站 |
| `mycook.alexander.xin` | 自托管完整站（图片版） |
| `cook-mcp.alexander.xin` | 远程 MCP（鉴权） |

站内「图片版」入口与 `/ai-agents`、`/auth.md` 已按上述分工更新。

### 说明

- lite / full 只差是否打包上游菜谱图片目录，运行时都是 nginx 静态站，不是「精简业务」

---

## v1.6.0 — 2026-08-08

### 体验

- **中英双语**：首页组件、导航、页脚、搜索、快捷键、致谢全部 i18n；语言只跟 URL 走，不再被 localStorage 带偏
- **视觉打磨**：窑火纸面质感、暗色统一、滚动显现、章节装饰
- **文案**：版权 / 致谢 / 关于页去掉「非官方 CSV」「站群 fork」这类用户不需要的黑话

### 修复

- 首页点「图片版」被 VitePress 路由拦成 404：改为整页打开独立 SPA
- Service Worker 只缓存成功的 HTML，避免把错误页/非 HTML 缓存成「乱码屏」
- 去掉导航里重复的 EN 文字链，只保留右上角语言按钮

### 文档与部署

- AI Agent / MCP 不再写成 Cursor 专用，示例配置覆盖常见客户端
- `DOCKER.md` 补上自托管内存/磁盘参考（lite 运行时约 30MB）

---

## v1.5.0 — 2026-08-07

### 新功能

- **开冰箱 · 转一转**：轻量集成 Cook 食用手册 CSV（`pantry.json`），食材反查 + 站内随机转盘
- **一周菜单**：`MealPlanner` 组件，7 天排餐，localStorage 持久化
- **厨房技巧速查**：`tips-index.json` + `KitchenTips` 组件（18 篇 HowToCook tips）
- **MCP Server**：`mcp/server.mjs` — 8 tools + 2 prompts，支持 stdio 与 HTTP（`:3001/mcp`）
- **发给 AI**：菜谱页工具栏一键复制「提示词 + 正文」
- **WebMcp 扩展**：浏览器内注册搜索、食材反查、随机等工具
- **Agent 发现增强**：MCP server-card、OpenAPI、Agent Skills、Markdown 镜像

### 构建与 CI

- `generate-all` 一次产出 stats / index / tips / agent 发现
- `npm run validate` 冒烟测试（JSON 产物 + MCP 工具）
- **Sync & Build**：构建后 validate、扩展产物校验、部署 Summary
- **Docker**：semver 标签、`mycook-mcp` sidecar 镜像、Buildx 缓存分 scope
- **Release** 工作流：push `v*` tag 自动创建 GitHub Release
- **PR Check**：覆盖 sync-integrations / mcp / validate

### 部署

- 默认 Docker **lite** 镜像（`SKIP_IMAGES=1`）
- `scripts/install.sh` / `install.ps1` 一键部署
- `bin/mycook.mjs` CLI：`docker:pull` · `mcp` · `dev` 等
- `docker compose --profile agent` MCP sidecar

### 体验

- 键盘帮助 `?`、Skip Link、阅读进度、Install Prompt
- PWA sw v5，缓存 pantry / tips-index
- 无障碍：`prefers-reduced-motion`、focus-visible、progressbar ARIA

---

## v1.3.0 — 功能增强

- SEO：`sitemap.xml`、字体 CDN、`LazyImage`
- PWA：Service Worker、可安装
- `RecipeToolbar`：收藏、分享、随机、计时器、打印
- 搜索快捷键、深色模式

---

## 早期版本

见 [GitHub Releases](https://github.com/AlexanderJ-Carter/MyCook/releases)。
