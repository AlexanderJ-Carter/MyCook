# AGENTS.md

本文档帮助 AI 助手更好地理解和维护 MyCook 项目。

## 项目概述

MyCook 是一个合并整理两个菜谱项目的静态网站：
- CookLikeHOC - 《老乡鸡菜品溯源报告》整理，按烹饪方式分类（炒菜、炖菜、卤菜等）
- HowToCook - 程序员在家做饭方法指南，按食材分类（素菜、荤菜、水产等）

## 技术栈

- **构建工具**：VitePress 1.x
- **部署**：GitHub Pages + GitHub Actions
- **运行时**：Node.js 22
- **包管理器**：npm

## 关键文件

### 配置文件

| 文件                          | 用途                         |
| ----------------------------- | ---------------------------- |
| `.vitepress/navSidebar.mjs`   | 导航和侧边栏自动生成逻辑     |
| `.vitepress/theme/style.css`  | 全局样式定义                 |
| `.vitepress/theme/Layout.vue` | 自定义布局组件               |
| `index.md`                    | 首页配置（Hero、卡片、致谢） |

### 构建脚本

| 文件                         | 用途                                                |
| ---------------------------- | --------------------------------------------------- |
| `scripts/generate-all.js`    | 一次扫描生成 recent / stats / index，再跑 agent-discovery |
| `scripts/scan-recipes.mjs`   | 共享菜谱文件扫描逻辑 |
| `scripts/mcp-tools.mjs`      | MCP / Agent 共享只读工具 |
| `mcp/server.mjs`             | MCP Server（stdio + HTTP） |
| `scripts/build-howtocook-images.js` | 构建图片版到 `public/howtocook-images/` |

### CI/CD

| 文件                                   | 用途                   |
| -------------------------------------- | ---------------------- |
| `.github/workflows/sync-and-build.yml` | 同步 → 构建 → 发布流程 |

## 目录约定

```
MyCook/
├── cooklikehoc/     # CookLikeHOC 内容，目录结构：
│   ├── 炒菜/
│   ├── 炖菜/
│   ├── 卤菜/
│   └── ...
├── howtocook/       # HowToCook 内容，目录结构：
│   ├── dishes/
│   │   ├── vegetable_dish/
│   │   ├── meat_dish/
│   │   └── ...
│   ├── tips/
│   └── starsystem/
```

## 开发命令

```bash
# 安装依赖
npm install

# 同步上游内容
npm run sync
# 或指定路径
COOKLIKEHOC_PATH=/path/to/CookLikeHOC HOWTOCOOK_PATH=/path/to/HowToCook npm run sync

# 开发服务器
npm run docs:dev

# 构建
npm run docs:build

# 预览
npm run docs:preview

# MCP（需先 npm run generate）
npm run mcp          # stdio
npm run mcp:http     # HTTP :3001
```

## 内容来源

内容来自两个上游仓库的 fork：
- `https://github.com/AlexanderJ-Carter/CookLikeHOC`
- `https://github.com/AlexanderJ-Carter/HowToCook`

CI 在构建时会克隆这两个仓库并同步内容。

## 样式约定

### 主题色（青钢灶台）

```css
/* 品牌主色（辣椒红） */
--vp-c-brand-1: #c4452f;
--vp-c-brand-2: #a83826;
--vp-c-brand-3: #8c2e1f;

/* HowToCook 区域标识色 */
--mycook-jade: #2a7a62;

/* 底与字 */
--mycook-mist / --vp-c-bg: #eef1ef;
--mycook-ink: #1a1f1c;
```

### 内容区区分

- CookLikeHOC 内容页：左侧辣椒红边框
- HowToCook 内容页：左侧青绿色边框
- 菜谱页工具：`RecipeToolbar`（收藏 / 打印 / 计时）

## 常见修改

### 添加新功能

1. 创建 Vue 组件在 `.vitepress/theme/`
2. 在 `.vitepress/theme/index.js` 中注册
3. 在 `index.md` 或样式文件中使用

### 修改导航/侧边栏

编辑 `.vitepress/navSidebar.mjs`，修改 `generateNavAndSidebar` 函数。

### 修改主题样式

编辑 `.vitepress/theme/style.css`。

### 添加新的内容来源

1. 修改 `scripts/sync-upstream.js` 添加同步逻辑
2. 修改 `.vitepress/navSidebar.mjs` 添加导航生成
3. 更新 `.github/workflows/sync-and-build.yml` 克隆新仓库

## 注意事项

1. **不要提交 `cooklikehoc/` 和 `howtocook/` 目录**，它们在 `.gitignore` 中
2. **修改菜谱内容请到上游仓库**，本仓库只做同步
3. **构建前需要先同步内容**，否则导航会为空
4. **recent.json 在构建时生成**，存放在 `public/`
5. **Windows 勿创建 `agents.md`**，会与 `AGENTS.md` 冲突；用户面向页面用 `ai-agents.md`

## Agent / MCP

- 发现文件：`scripts/generate-agent-discovery.js` → `public/.well-known/*`
- MCP 工具逻辑：`scripts/mcp-tools.mjs`（与 `mcp/server.mjs` 共享）
- 浏览器 WebMcp：`.vitepress/theme/WebMcp.vue`
- 文档：[MCP.md](./MCP.md) · 站点 [/ai-agents](/ai-agents)

## 上游许可证

- HowToCook：Unlicense（公共领域）
- CookLikeHOC：无明确许可证，内容来自公开资料
