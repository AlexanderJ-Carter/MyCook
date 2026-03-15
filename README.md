# MyCook

合并 [CookLikeHOC](https://github.com/AlexanderJ-Carter/CookLikeHOC) 与 [HowToCook](https://github.com/AlexanderJ-Carter/HowToCook)（你的 fork）的菜谱站，用 GitHub Pages 托管。

---

## 部署（GitHub Pages）

1. 把本仓库推到你的 GitHub。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
3. 发布/更新站点：
   - **Actions** 页选 **Sync & Build**，点 **Run workflow**；或
   - 每天会自动跑一次（UTC 2:00 / 北京 10:00），从两个 fork 拉取后构建并发布。

站点地址：`https://<你的用户名>.github.io/<本仓库名>/`

---

## 二次开发

- **改菜谱、加新菜**：在 **CookLikeHOC** 或 **HowToCook** 仓库里改，推送到 GitHub；再在 MyCook 的 **Actions** 里点一次 **Run workflow** 即可更新站点。
- **改主题、首页、脚本**：在 **MyCook** 里改，改完 push，再跑一次 **Sync & Build** 发布。
