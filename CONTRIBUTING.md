# 贡献指南

感谢关注 MyCook！

## 项目是什么

静态菜谱站 + Docker 镜像 + 可选 MCP Agent。内容来自 [CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC) 与 [HowToCook](https://github.com/Anduin2017/HowToCook) 的 fork 同步，站点功能在本仓库开发。

## 贡献方式

### 报告问题

1. 搜索 [现有 Issues](https://github.com/AlexanderJ-Carter/MyCook/issues)
2. 新建 Issue：现象、复现步骤、浏览器/环境、期望结果

### 改站点功能（本仓库）

| 区域 | 路径 |
|------|------|
| 主题与组件 | `.vitepress/theme/` |
| 首页 | `index.md` |
| 构建脚本 | `scripts/` |
| MCP | `mcp/`、`scripts/mcp-tools.mjs` |
| CI | `.github/workflows/` |

### 改菜谱正文（上游 fork）

- [AlexanderJ-Carter/HowToCook](https://github.com/AlexanderJ-Carter/HowToCook)
- [AlexanderJ-Carter/CookLikeHOC](https://github.com/AlexanderJ-Carter/CookLikeHOC)

推送后等待 MyCook **Sync & Build** 自动同步（或手动触发 Actions）。

## 本地开发

```bash
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook && npm install
npm run sync              # 需上游仓库路径
npm run docs:dev
```

### 提交前检查

```bash
npm run generate
npm run validate          # JSON + MCP 冒烟测试
npm run docs:build:fast   # 快速构建验证
```

PR 会触发 **PR Check** 工作流（语法检查 + 有内容时完整 validate/build）。

## Pull Request

1. 从 `main` 拉分支
2. 聚焦单一改动，说明动机
3. 标题格式：`feat:` / `fix:` / `docs:` / `ci:` + 简述

## 发版（维护者）

1. 更新 `package.json` 版本与 `CHANGELOG.md`
2. `git tag vX.Y.Z && git push origin vX.Y.Z`
3. 自动触发：**Release** · **Docker** 版本标签 · **Pages**（main 已持续部署）

## 许可证

贡献代码以 MIT 发布。菜谱内容版权归各上游作者所有。
