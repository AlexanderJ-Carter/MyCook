# 贡献指南

感谢你对 MyCook 项目的兴趣！

## 项目简介

MyCook 是一个合并整理 [CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC) 和 [HowToCook](https://github.com/Anduin2017/HowToCook) 的菜谱网站，使用 VitePress 构建，部署在 GitHub Pages。

## 如何贡献

### 报告问题

如果你发现网站显示异常或有改进建议：

1. 查看 [现有 Issues](https://github.com/AlexanderJ-Carter/MyCook/issues) 确认问题未被报告
2. 创建新 Issue，描述问题、复现步骤和预期结果

### 提交改进

#### 网站相关修改

直接在 MyCook 仓库修改：

- 主题样式：`.vitepress/theme/style.css`
- 首页配置：`index.md`
- 构建脚本：`scripts/`
- 工作流配置：`.github/workflows/`

#### 菜谱内容修改

菜谱内容来源于上游仓库，请在对应仓库提交修改：

- **HowToCook 内容**：在 [你的 HowToCook fork](https://github.com/AlexanderJ-Carter/HowToCook) 修改
- **CookLikeHOC 内容**：在 [你的 CookLikeHOC fork](https://github.com/AlexanderJ-Carter/CookLikeHOC) 修改

修改后，MyCook 会在下次同步时自动更新。

## 本地开发

### 环境要求

- Node.js >= 18
- npm

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook

# 安装依赖
npm install

# 同步上游内容（需要 CookLikeHOC 和 HowToCook 在上级目录）
npm run sync

# 启动开发服务器
npm run docs:dev

# 构建生产版本
npm run docs:build
```

### 目录结构

```
MyCook/
├── .vitepress/          # VitePress 配置
│   ├── theme/           # 主题自定义
│   └── navSidebar.mjs   # 导航和侧边栏配置
├── cooklikehoc/         # CookLikeHOC 同步内容
├── howtocook/           # HowToCook 同步内容
├── scripts/             # 构建脚本
├── public/              # 静态资源
├── index.md             # 首页配置
└── package.json
```

### 自定义主题

主题文件位于 `.vitepress/theme/`：

- `style.css` - 全局样式
- `Layout.vue` - 布局组件
- `RecentUpdates.vue` - 最近更新组件

## Pull Request 规范

1. 从 `main` 分支创建功能分支
2. 确保本地测试通过
3. PR 标题清晰描述改动内容
4. 关联相关 Issue（如有）

### Commit 信息格式

```
类型: 简短描述

# 示例
feat: 添加深色模式支持
fix: 修复移动端导航显示问题
docs: 更新 README 部署说明
style: 优化首页卡片样式
```

类型说明：
- `feat`：新功能
- `fix`：修复问题
- `docs`：文档更新
- `style`：样式调整
- `refactor`：代码重构
- `chore`：构建/工具相关

## 许可证

本项目采用 MIT 许可证。贡献的代码将按照相同许可证发布。

内容来源请参阅 [LICENSE](./LICENSE) 中的致谢声明。
