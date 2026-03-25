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

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/AlexanderJ-Carter/MyCook/sync-and-build.yml?branch=main&label=Build&style=flat-square" alt="Build Status">
  <img src="https://img.shields.io/github/v/release/AlexanderJ-Carter/MyCook?style=flat-square&display_name=tag" alt="Release">
  <img src="https://img.shields.io/github/license/AlexanderJ-Carter/MyCook?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/last-commit/AlexanderJ-Carter/MyCook?style=flat-square" alt="Last Commit">
  <img src="https://img.shields.io/docker/pulls/ghcr.io/alexanderj-carter/mycook?style=flat-square" alt="Docker Pulls">
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
├── .github/workflows/       # Sync & Build（克隆 fork → 同步 → 构建 → 发布）
├── .vitepress/
│   ├── theme/               # 自定义主题（暖色、入口卡片、双源色条）
│   └── navSidebar.mjs       # 导航与侧栏自动生成
├── scripts/
│   ├── sync-upstream.js     # 同步内容到 cooklikehoc/、howtocook/，并写 public/sync-info.json
│   ├── build-howtocook-images.js  # 构建图片版到 public/howtocook-images/（站内子路径）
│   ├── generate-recent.js   # 生成 public/recent.json（最近更新）
│   └── generate-stats.js    # 生成 public/stats.json（菜谱统计）
├── public/                  # 静态资源与构建时生成的 recent.json、stats.json、sync-info.json、howtocook-images/
├── cooklikehoc/             # CookLikeHOC 内容（同步填充，.gitignore）
├── howtocook/               # HowToCook 内容（同步填充，.gitignore）
├── index.md                 # 首页
├── Dockerfile               # 多阶段：克隆 fork → 同步 → 构建 → nginx
└── docker-compose.yml       # 生产 + 开发 profile
```

> `cooklikehoc/`、`howtocook/` 及 `public/recent.json`、`public/stats.json`、`public/sync-info.json`、`public/howtocook-images/` 为同步/构建时生成，已加入 `.gitignore`。

---

## 快速部署

### GitHub Pages（推荐）

1. Fork 本仓库
2. 进入 **Settings → Pages → Build and deployment**
3. **Source** 选择 **GitHub Actions**（不要选 "Deploy from a branch"）
4. 推送代码后会自动构建发布

### Docker 部署

镜像**内置克隆与同步**：构建时会从 GitHub 克隆 `AlexanderJ-Carter/CookLikeHOC` 与 `AlexanderJ-Carter/HowToCook`，无需本地预置内容。

```bash
# 直接构建（推荐）
docker build -t mycook:latest .
docker run -d -p 80:80 mycook:latest
```

或使用已发布镜像：

```bash
docker pull ghcr.io/alexanderj-carter/mycook:latest
docker run -d -p 80:80 ghcr.io/alexanderj-carter/mycook:latest
```

访问 http://localhost 。如需指定其它仓库或分支，可使用 build-arg：`docker build --build-arg COOKLIKEHOC_BRANCH=main --build-arg HOWTOCOOK_BRANCH=master -t mycook .`

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

## 同步机制

- **CI**：每次 push 到 `main` 或每日定时（UTC 2:00，北京 10:00），会克隆 `AlexanderJ-Carter/CookLikeHOC`、`AlexanderJ-Carter/HowToCook`、`king-jingxiang/HowToCook`（图片版）到 `upstream/`，执行 `sync-upstream.js`、`build:images`（输出 `public/howtocook-images/`），生成 `recent.json`、`stats.json`、`sync-info.json`，再构建并部署到 GitHub Pages。
- **本地**：将 CookLikeHOC、HowToCook 放在上级目录或设置 `COOKLIKEHOC_PATH`、`HOWTOCOOK_PATH`，执行 `npm run sync` 后 `npm run docs:build`。
- **手动触发**：**Actions → Sync & Build → Run workflow** 可立即同步并发布。

| 场景        | 操作                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| 更新菜谱    | 在 CookLikeHOC 或 HowToCook fork 中修改并推送，再在 MyCook 触发 Sync & Build 或等每日定时 |
| 改主题/首页 | 直接改 MyCook 内文件，推送到 main 后自动重建                                              |

---

## 故障排查

- **Get Pages site failed / Not Found**：到仓库 **Settings → Pages → Build and deployment**，将 **Source** 选为 **GitHub Actions**（不要选 “Deploy from a branch”），保存后再重新跑一次 Actions。
- **/howtocook-images/ 404 或显示「构建未就绪」**：图片版在 CI 中可能构建失败。打开 **Actions → 最近一次 Sync & Build → Install & Sync & Build** 日志，搜索 `build-howtocook-images` 查看报错；修复后重新跑 workflow。图片版仓库仅有 `pnpm-lock.yaml`，构建脚本会优先用 `corepack pnpm install --frozen-lockfile && pnpm run build`，若 pnpm 不可用会自动回退 `npm install && npm run build`。
- **Settings → Pages** 确认 Source 为 **GitHub Actions**
- DNS: `cook.alexander.xin` 的 CNAME 记录指向 `alexanderj-carter.github.io`
- **Actions** 里确认最近一次 **Sync & Build** 成功

---

## 致谢

本项目内容来源于以下开源项目，向原作者致以诚挚感谢：

- **[HowToCook](https://github.com/Anduin2017/HowToCook)** by [Anduin2017](https://github.com/Anduin2017) - 程序员在家做饭方法指南
- **[CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC)** by [Gar-b-age](https://github.com/Gar-b-age) - 像老乡鸡那样做饭

本仓库非上述项目官方站点，为个人整理维护。

### 衍生（站内子路径）

- **HowToCook 图片版** — 集成在本站子路径 `/howtocook-images/`（与 cooklikehoc、howtocook 一样不跳转外站），源自 [king-jingxiang/HowToCook](https://github.com/king-jingxiang/HowToCook)。构建时克隆该仓库并执行 `build:images` 输出到 `public/howtocook-images/`。本地可设 `SKIP_IMAGES=1` 跳过图片版构建，或 `HOWTOCOOK_IMAGES_PATH=../HowToCookImages` 使用本地目录。

## 许可证

本项目采用 [MIT License](./LICENSE) 开源。

内容版权归原作者所有。

## 更新日志

### v1.2.0

- 新增阅读进度条和回到顶部按钮
- 新增自定义 404 页面
- 新增帮助和关于页面
- 优化暗色模式配色
- 完善 Open Graph 和 SEO 结构化数据
- CI/CD 流水线优化（并发控制、多架构 Docker 镜像）
- 字体加载优化（DNS 预连接）

查看 [Releases](https://github.com/AlexanderJ-Carter/MyCook/releases) 了解更多历史版本。

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## Star History

如果这个项目对你有帮助，欢迎在 GitHub 上点个 ⭐ 支持一下！
