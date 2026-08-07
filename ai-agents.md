---
title: AI Agent 与 MCP
description: MyCook 面向 AI 代理的发现端点、MCP 服务与使用指南
---

# AI Agent 与 MCP

MyCook 不只是给人看的菜谱站，也是给 **AI Agent** 读的厨房知识库。

## 你能用什么

| 能力 | 说明 |
|------|------|
| **公开 JSON** | `/recipes-index.json`、`/stats.json`、`/pantry.json` |
| **Markdown 镜像** | Docker 部署下 `Accept: text/markdown` 获取正文 |
| **Agent Skills** | [/.well-known/agent-skills/](https://cook.alexander.xin/.well-known/agent-skills/index.json) |
| **OpenAPI** | [/openapi.json](https://cook.alexander.xin/openapi.json) |
| **MCP Server** | 可选 stdio / HTTP sidecar，见 [MCP 文档](https://github.com/AlexanderJ-Carter/MyCook/blob/main/MCP.md) |
| **WebMcp** | 浏览器内自动注册工具（Chrome WebMCP 实验特性） |

## 快速接入 Cursor

```bash
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook && npm install && npm run generate
```

在 Cursor **Settings → MCP** 添加：

```json
{
  "mcpServers": {
    "mycook": {
      "command": "node",
      "args": ["mcp/server.mjs"],
      "cwd": "/你的路径/MyCook",
      "env": {
        "MYCOOK_DATA": "/你的路径/MyCook/public"
      }
    }
  }
}
```

然后对 Agent 说：「用 mycook 搜一下番茄鸡蛋相关菜谱」。

## 菜谱页 · 发给 AI

任意菜谱页右下角工具栏有 **「发给 AI」**：复制「提示词 + 正文」到剪贴板，粘贴到 ChatGPT / Claude / Cursor 即可问答，**无需本站 API Key**。

## 自托管 MCP（HTTP）

```bash
npm run mcp:http
# http://127.0.0.1:3001/mcp
```

Docker：

```bash
docker compose --profile agent up -d --build
```

## 发现文档

- [auth.md](/auth.md) — 匿名只读访问
- [AGENTS.md](/AGENTS.md) — 项目维护者指南

## 工具一览

`search_recipes` · `get_recipe` · `get_recipe_markdown` · `get_site_stats` · `get_recent_updates` · `search_by_ingredients` · `list_pantry_ingredients` · `random_recipe`

Prompts：`what_to_cook` · `recipe_assistant`
