# CLAUDE.md

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

| 文件 | 用途 |
|------|------|
| `.vitepress/navSidebar.mjs` | 导航和侧边栏自动生成逻辑 |
| `.vitepress/theme/style.css` | 全局样式定义 |
| `.vitepress/theme/Layout.vue` | 自定义布局组件 |
| `index.md` | 首页配置（Hero、卡片、致谢） |

### 构建脚本

| 文件 | 用途 |
|------|------|
| `scripts/sync-upstream.js` | 从上游仓库同步内容到 `cooklikehoc/` 和 `howtocook/` |
| `scripts/generate-recent.js` | 扫描文件生成最近更新列表 |

### CI/CD

| 文件 | 用途 |
|------|------|
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
```

## 内容来源

内容来自两个上游仓库的 fork：
- `https://github.com/AlexanderJ-Carter/CookLikeHOC`
- `https://github.com/AlexanderJ-Carter/HowToCook`

CI 在构建时会克隆这两个仓库并同步内容。

## 样式约定

### 主题色

```css
/* 品牌主色（姜黄/琥珀） */
--vp-c-brand-1: #c17f3a;
--vp-c-brand-2: #a66b2d;
--vp-c-brand-3: #8b5a24;

/* HowToCook 区域标识色 */
#2d7d5e (绿色)
```

### 内容区区分

- CookLikeHOC 内容页：左侧橙色边框
- HowToCook 内容页：左侧绿色边框

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

## 上游许可证

- HowToCook：Unlicense（公共领域）
- CookLikeHOC：无明确许可证，内容来自公开资料
