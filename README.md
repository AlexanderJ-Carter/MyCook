# MyCook

合并 [CookLikeHOC](https://github.com/AlexanderJ-Carter/CookLikeHOC) 与 [HowToCook](https://github.com/AlexanderJ-Carter/HowToCook)（fork）的菜谱站，用 VitePress 构建并托管在 GitHub Pages。

**访问地址**：[cook.alexander.xin](https://cook.alexander.xin)

---

## 项目结构

```
MyCook/
├── .github/workflows/sync-and-build.yml  # CI/CD：同步 → 构建 → 发布
├── .vitepress/
│   ├── config.mjs          # VitePress 配置（导航、侧边栏自动生成）
│   ├── navSidebar.mjs      # 扫描 cooklikehoc/ 与 howtocook/ 自动生成导航
│   └── theme/              # 自定义主题（暖色调、入口卡片、最近更新组件）
├── scripts/
│   ├── sync-upstream.js    # 从上游 fork 同步菜谱内容到本地
│   └── generate-recent.js  # 生成最近更新列表（写入 public/recent.json）
├── public/
│   └── CNAME               # 自定义域名（构建时复制到 dist/）
├── index.md                # 首页
├── CNAME                   # 仓库级自定义域名配置
└── package.json
```

> `cooklikehoc/` 与 `howtocook/` 目录由 CI 在构建时自动从上游同步，已加入 `.gitignore`，不提交到仓库。

---

## 部署（GitHub Pages）

1. 把本仓库推到 GitHub。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions** （不要选 "Deploy from a branch"）。
3. 在 **Settings → Pages → Custom domain** 填写 `cook.alexander.xin` 并保存。
4. **推送到 main 后会自动触发构建并发布**；也可在 **Actions → Sync & Build → Run workflow** 手动触发，每天 UTC 2:00（北京 10:00）也会定时运行一次。

---

## 本地开发

```bash
# 先把上游内容同步到本地（需要先把两个 fork 克隆到同级目录）
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
| 更新菜谱内容 | 在 CookLikeHOC 或 HowToCook fork 里修改并推送；回到 MyCook 推送一次（或手动触发 Sync & Build）即可同步发布 |
| 更改站点主题/首页 | 直接改 MyCook 里的文件，推送到 main 后自动重建 |
| 立即强制同步 | **Actions → Sync & Build → Run workflow** |

---

## 打不开时排查

- **Settings → Pages** 确认 Source 为 **GitHub Actions**，Custom domain 已填写 `cook.alexander.xin`。
- DNS: `cook.alexander.xin` 的 CNAME 记录指向 `alexanderj-carter.github.io`。
- **Actions** 里确认最近一次 **Sync & Build** 成功；若失败，查看日志修复后重新推送。
