# Changelog

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
