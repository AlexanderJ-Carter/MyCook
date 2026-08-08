# 使用帮助

欢迎使用 MyCook！本页面将帮助你更好地使用本站功能。

## 🔍 搜索功能

### 快速搜索
- **快捷键**：按 `Ctrl+K`（Mac: `Cmd+K`）或 `/` 键快速打开搜索框
- **搜索范围**：支持搜索菜谱名称、食材、烹饪步骤等
- **模糊匹配**：即使输入不完整也能找到相关菜谱

## ❤️ 收藏功能

### 收藏菜谱
- 在任意菜谱页面，点击右下角的「收藏」按钮
- 收藏的菜谱会保存在浏览器本地存储中
- 再次点击可取消收藏

### 查看收藏
- 点击「我的收藏」按钮展开收藏列表
- 收藏列表按添加时间排序
- 可以快速跳转到收藏的菜谱

> 💡 **提示**：收藏数据存储在浏览器本地，清除浏览器数据会导致收藏丢失。

## ⏱️ 烹饪计时器

### 使用方法
在菜谱页面中使用 `<CookingTimer />` 组件：

```html
<CookingTimer />
```

### 功能说明
- **添加计时器**：输入名称和时长，点击「添加」
- **开始/暂停**：控制计时器的运行状态
- **重置**：将计时器恢复到初始状态
- **多计时器**：可以同时运行多个计时器
- **完成提醒**：计时结束时会播放提示音并显示通知

### 使用场景
- 煮面条、炖汤、蒸菜等需要精确控制时间的烹饪过程
- 同时烹饪多道菜时，分别计时

## 🖨️ 打印菜谱

### 打印方式
在菜谱页面中使用 `<PrintButton />` 组件：

```html
<PrintButton />
```

点击「打印」按钮即可打印当前菜谱。

### 打印优化
- 自动隐藏导航栏、侧边栏等无关元素
- 优化字体大小和排版
- 保留食材列表和步骤说明
- 图片会自动调整大小

## 📱 PWA 功能

### 安装应用
本站支持 PWA（渐进式 Web 应用），可以安装到设备主屏幕：

**电脑端**：
- Chrome：地址栏右侧点击「安装」图标
- Edge：地址栏右侧点击「应用可用」图标

**移动端**：
- iOS Safari：分享菜单 → 添加到主屏幕
- Android Chrome：菜单 → 添加到主屏幕

### 离线访问
- 安装后支持离线访问已浏览的菜谱
- 自动缓存常用资源，加快加载速度

## 🖼️ 图片优化

### 懒加载
所有菜谱图片支持懒加载：
- 滚动到图片位置时才开始加载
- 节省流量，提升页面加载速度

### 使用方法
在 Markdown 中使用 `<LazyImage />` 组件：

```html
<LazyImage src="/path/to/image.jpg" alt="图片描述" />
```

## 🎨 主题切换

### 深色模式
- 点击导航栏的主题切换按钮
- 支持跟随系统设置自动切换
- 深色模式下所有颜色经过优化，保护眼睛

## 📊 统计信息

首页显示菜谱统计：
- 总菜谱数量
- 分类数量
- 各来源菜谱数量

## 🧊 开冰箱 · 转一转

首页下方的「Play Kitchen」区块（也可从入口卡片 **04 · 开冰箱** 跳转）：

- **开冰箱**：勾选手头食材，从 [Cook 食用手册](https://github.com/YunYouJun/cook) 的搭配灵感里反查可做的菜（含 B 站视频链接），并尝试匹配站内菜谱
- **转一转**：在 577+ 道站内菜谱里随机抽一道，可按「做法库 / 食材指南」筛选

## 📅 一周菜单

首页 **「一周吃什么」**：为周一～周日选菜，存在本机浏览器；可搜索、随机填满、清空。

## 📚 厨房技巧

首页 **「厨房技巧速查」** 汇总 HowToCook 技巧（焯水、油温、微波炉等）。

## 🤖 发给 AI

菜谱页工具栏 **AI** 按钮：复制「提示词 + 正文」到 **任意聊天模型**（ChatGPT、Claude、Gemini 等），无需 API Key。

开发者可通过 **MCP / OpenAPI / Agent Skills** 接入，支持 Cursor、Claude Desktop、Copilot 等多种客户端。英文说明见 [/en/ai-agents](/en/ai-agents)，中文见 [/ai-agents](/ai-agents)。

## 🔔 通知权限

烹饪计时器支持浏览器通知：
- 首次使用计时器时，浏览器会请求通知权限
- 授权后，计时结束时会发送通知
- 即使浏览器在后台也能收到提醒

## 📂 内容来源

本站内容来源于两个开源项目：
- **CookLikeHOC**：《老乡鸡菜品溯源报告》整理
- **HowToCook**：程序员在家做饭方法指南

## 🐛 反馈问题

如遇到问题或有建议，请到 [GitHub 仓库](https://github.com/AlexanderJ-Carter/MyCook) 提交 Issue。

## 💡 使用技巧

1. **快捷键搜索**：`Ctrl+K`（Mac: `Cmd+K`）或 `/` 打开搜索；按 `?` 查看全部快捷键
2. **收藏常用菜谱**：收藏保存在本机浏览器，清除站点数据会丢失
3. **随机一道**：工具栏「随机」、首页「转一转」或「今日推荐」
4. **规划一周**：首页「一周吃什么」排菜单
5. **手边有什么**：首页「开冰箱」勾选食材
6. **发给 AI**：菜谱页工具栏 AI 按钮复制正文
7. **复制 / 分享**：工具栏一键操作
8. **打印备菜**：打印时隐藏导航，只保留正文

## 🐳 一键部署

### Docker（推荐）

```bash
# Linux / macOS / Git Bash
./scripts/install.sh                  # 拉取轻量镜像并启动（默认）
./scripts/install.sh docker-build     # 本地构建轻量版
./scripts/install.sh docker-full      # 完整版（含图片版，体积大）

# Windows PowerShell
.\scripts\install.ps1
.\scripts\install.ps1 -Mode docker-full
```

或使用 CLI：

```bash
npm run mycook -- docker:pull    # 拉取 GHCR 轻量镜像
npm run mycook -- docker:lite    # 本地构建轻量版
npm run mycook -- docker:full    # 完整版
npm run mycook -- docker:stop    # 停止
```

启动后访问 http://localhost:8080 ，查看镜像内容构成：

```bash
curl http://localhost:8080/image-manifest.json
```

### 镜像说明

| 变体 | 标签 | 约体积 | 包含 |
|------|------|--------|------|
| **lite**（默认） | `:latest` `:lite` | nginx ~25MB + 站点 ~580MB | 双源菜谱、搜索、PWA、Agent JSON |
| **full** | `:full` | + ~230MB | 额外含 `/howtocook-images/` |
| **mcp** | `mycook-mcp:latest` | 独立 sidecar | Streamable HTTP MCP，`:3001/mcp` |

运行时镜像**只有 nginx + 静态文件**，不含 Node.js。体积主要来自菜谱配图与 Markdown 页面。

### Node 本地开发

```bash
npm install
npm run sync          # 需上级目录有上游仓库
npm run mycook -- dev
```

## 🔗 相关站点

- [alexander.xin](https://alexander.xin) — 作者主站
- [alexander.xin/projects](https://alexander.xin/projects) — 全部项目
- [GitHub 仓库](https://github.com/AlexanderJ-Carter/MyCook) — 源码与 Issue

---

祝你烹饪愉快！🍳
