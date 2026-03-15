# MyCook

<p align="center">
  <strong>老乡鸡风格菜谱 + 程序员做饭指南，一站搞定</strong>
</p>

<p align="center">
  <a href="https://cook.alexander.xin">在线访问</a> •
  <a href="#功能特性">功能特性</a> •
  <a href="#快速部署">快速部署</a> •
  <a href="#本地开发">本地开发</a>
</p>

---

## 简介

MyCook 是一个合并整理两个优秀菜谱项目的静态网站：

- **[CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC)** - 《老乡鸡菜品溯源报告》整理，按烹饪方式分类
- **[HowToCook](https://github.com/Anduin2017/HowToCook)** - 程序员在家做饭方法指南，按食材分类

使用 VitePress 构建，支持站内搜索、响应式设计、深色模式，部署在 GitHub Pages。

**访问地址**：[cook.alexander.xin](https://cook.alexander.xin)

## 功能特性

- 📖 **双源菜谱** - 整合两个项目的丰富内容，按不同维度分类
- 🔍 **站内搜索** - 快速查找菜谱与技巧
- 🌙 **深色模式** - 自动跟随系统，也可手动切换
- 📱 **响应式设计** - 完美适配桌面与移动设备
- ⏰ **每日同步** - 自动从上游仓库拉取更新
- 🐳 **Docker 支持** - 支持容器化部署

## 项目结构

```
MyCook/
├── .github/workflows/       # GitHub Actions CI/CD
├── .vitepress/
│   ├── theme/               # 自定义主题（暖色调、入口卡片）
│   └── navSidebar.mjs       # 导航与侧边栏自动生成
├── scripts/
│   ├── sync-upstream.js     # 从上游同步内容
│   └── generate-recent.js   # 生成最近更新列表
├── public/                  # 静态资源
├── cooklikehoc/             # CookLikeHOC 内容（自动同步）
├── howtocook/               # HowToCook 内容（自动同步）
├── index.md                 # 首页配置
├── Dockerfile               # Docker 构建文件
└── docker-compose.yml       # Docker Compose 配置
```

> `cooklikehoc/` 与 `howtocook/` 目录由 CI 在构建时自动从上游同步，已加入 `.gitignore`。

---

## 快速部署

### GitHub Pages（推荐）

1. Fork 本仓库
2. 进入 **Settings → Pages → Build and deployment**
3. **Source** 选择 **GitHub Actions**（不要选 "Deploy from a branch"）
4. 推送代码后会自动构建发布

### Docker 部署

```bash
# 拉取镜像
docker pull ghcr.io/alexanderj-carter/mycook:latest

# 运行容器
docker run -d -p 80:80 ghcr.io/alexanderj-carter/mycook:latest
```

访问 `http://localhost` 即可。

---

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
COOKLIKEHOC_PATH=../CookLikeHOC HOWTOCOOK_PATH=../HowToCook npm run sync

# 启动开发服务器
npm run docs:dev

# 构建静态文件
npm run docs:build

# 预览构建结果
npm run docs:preview
```

---

## 内容更新

| 场景 | 操作 |
|------|------|
| 更新菜谱内容 | 在 CookLikeHOC 或 HowToCook fork 里修改并推送；回到 MyCook 推送一次即可同步发布 |
| 更改站点主题/首页 | 直接改 MyCook 里的文件，推送到 main 后自动重建 |
| 立即强制同步 | **Actions → Sync & Build → Run workflow** |

自动同步时间：每天 UTC 2:00（北京时间 10:00）

---

## 故障排查

- **Settings → Pages** 确认 Source 为 **GitHub Actions**
- DNS: `cook.alexander.xin` 的 CNAME 记录指向 `alexanderj-carter.github.io`
- **Actions** 里确认最近一次 **Sync & Build** 成功

---

## 致谢

本项目内容来源于以下开源项目，向原作者致以诚挚感谢：

- **[HowToCook](https://github.com/Anduin2017/HowToCook)** by [Anduin2017](https://github.com/Anduin2017) - 程序员在家做饭方法指南
- **[CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC)** by [Gar-b-age](https://github.com/Gar-b-age) - 像老乡鸡那样做饭

本仓库非上述项目官方站点，为个人整理维护。

## 许可证

本项目采用 [MIT License](./LICENSE) 开源。

内容版权归原作者所有。
