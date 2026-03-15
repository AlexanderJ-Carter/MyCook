# MyCook

合并 [CookLikeHOC](https://github.com/AlexanderJ-Carter/CookLikeHOC) 与 [HowToCook](https://github.com/AlexanderJ-Carter/HowToCook)（你的 fork）的菜谱站，用 GitHub Pages 托管。

---

## 部署（GitHub Pages）

1. 把本仓库推到 GitHub。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**（不要选 “Deploy from a branch”）。
3. **推送 main 后会自动触发构建并发布**；也可在 **Actions** 里选 **Sync & Build** → **Run workflow**。每天定时也会跑一次。

**访问地址（必带仓库名和末尾斜杠）**：  
`https://alexanderj-carter.github.io/MyCook/`

若用**自定义域名**（如 cook.alexander.xin）且打开是 404，在 `.github/workflows/sync-and-build.yml` 里把 `VITEPRESS_BASE: /${{ github.event.repository.name }}/` 改成 `VITEPRESS_BASE: '/'`，保存后推送，等 Actions 跑完再访问自定义域名。

---

## 打不开时检查

- Source 是否为 **GitHub Actions**（不是 gh-pages 分支）。
- 地址是否带 **仓库名** 和 **末尾斜杠**：`.../MyCook/`。
- **Actions** 里最近一次 **Sync & Build** 是否绿色成功；失败则看日志修错后再推送。

---

## 二次开发

- **改菜谱**：在 CookLikeHOC / HowToCook 里改并推送；再在 MyCook 推送一次或跑一次 **Sync & Build** 即可更新站点。
- **改主题、首页、脚本**：在 MyCook 里改，推送到 main 后会自动重建发布。
