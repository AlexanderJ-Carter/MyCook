---
title: 关于本站
---

# 关于 MyCook

MyCook 是 [alexander.xin](https://alexander.xin) 站群中的菜谱子站：**把两套开源菜谱合成一张厨房桌面**，并补上搜索、周菜单、PWA 与 AI Agent 能力。

**在线地址**：[cook.alexander.xin](https://cook.alexander.xin)

## 项目初衷

自己做饭时经常在多个站点之间切换——按做法找、按食材找、看图找灵感各有一套。MyCook 把它们收进一个入口，再加了「开冰箱」「一周吃什么」「发给 AI」等顺手功能。

## 内容来源

| 项目 | 说明 |
|------|------|
| [CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC) | 老乡鸡风格，按炒/炖/卤/汤分类 |
| [HowToCook](https://github.com/Anduin2017/HowToCook) | 程序员做饭指南，按食材与难度 |
| [HowToCook 图片版](https://github.com/king-jingxiang/HowToCook) | 本站 [`/howtocook-images/`](/howtocook-images/) |
| [Cook 食用手册](https://github.com/YunYouJun/cook) | 开冰箱食材数据（CSV 轻量集成） |

菜谱正文在 CI 中从维护者 fork 同步，**不在 MyCook 仓库内直接改**。

## 技术栈

| 层级 | 技术 |
|------|------|
| 站点 | [VitePress](https://vitepress.dev/) 1.x |
| 发布 | GitHub Actions → Pages |
| 镜像 | GHCR `ghcr.io/alexanderj-carter/mycook` |
| Agent | MCP Server · OpenAPI · Agent Skills |
| 运行时（镜像内） | nginx:alpine + 静态 dist |

## 功能亮点

| 功能 | 说明 |
|------|------|
| 🔍 搜索 | `Ctrl+K` / `/`，577+ 菜谱 |
| 🧊 开冰箱 | 食材反查 + Cook 外链 + 随机转盘 |
| 📅 周菜单 | 7 天排餐，存本机浏览器 |
| 📚 技巧速查 | 18 篇 HowToCook 备忘 |
| ❤️ 工具栏 | 收藏 · 计时 · 分享 · 打印 · **发给 AI** |
| 🤖 Agent | MCP · WebMcp · Markdown 镜像（Docker） |
| ⏰ 同步 | 每日从上游 fork 自动更新 |

## 开源与站群

- **源码**：[AlexanderJ-Carter/MyCook](https://github.com/AlexanderJ-Carter/MyCook)（MIT）
- **主站**：[alexander.xin](https://alexander.xin)
- **项目索引**：[alexander.xin/projects](https://alexander.xin/projects)

## 免责声明

本站为个人整理维护，非上述项目的官方网站。烹饪请注意用火用电安全。

## 反馈

[GitHub Issues](https://github.com/AlexanderJ-Carter/MyCook/issues) · 喜欢请 ⭐
