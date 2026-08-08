# Changelog

## v1.6.1 — 2026-08-08

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
