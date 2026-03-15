# MyCook

合并 [CookLikeHOC](https://github.com/AlexanderJ-Carter/CookLikeHOC) 与 [HowToCook](https://github.com/AlexanderJ-Carter/HowToCook)（你的 fork）的菜谱站，用 GitHub Pages 托管。

---

## 部署（GitHub Pages）

1. 把本仓库推到 GitHub。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**（不要选 “Deploy from a branch”）。
3. **推送 main 后会自动触发构建并发布**；也可在 **Actions** 里选 **Sync & Build** → **Run workflow**。每天定时也会跑一次。

**访问地址**：`https://cook.alexander.xin`（已按自定义域名配置，构建使用 base `/`）。

---

## 打不开时检查

- **Settings → Pages** 里 Source 选 **GitHub Actions**，Custom domain 填好 `cook.alexander.xin` 并 Save。
- 域名解析：`cook.alexander.xin` 的 CNAME 指向 `alexanderj-carter.github.io`（或按 GitHub 保存后页面的提示配置）。
- **Actions** 里最近一次 **Sync & Build** 是否成功；失败则看日志修错后再推送。

---

## 二次开发

- **改菜谱**：在 CookLikeHOC / HowToCook 里改并推送；再在 MyCook 推送一次或跑一次 **Sync & Build** 即可更新站点。
- **改主题、首页、脚本**：在 MyCook 里改，推送到 main 后会自动重建发布。
