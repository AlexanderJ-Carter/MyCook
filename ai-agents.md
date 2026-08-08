---
title: AI Agent 与 MCP
description: MyCook 面向 AI 代理的发现端点、MCP 服务与使用指南
---

# AI Agent 与 MCP

MyCook 不只是给人看的菜谱站，也是给 **AI Agent** 读的厨房知识库。接入方式与具体客户端无关——ChatGPT、Claude、Gemini、Copilot、Cursor、自建 Agent 均可。

## 三种用法（按门槛从低到高）

### 1. 复制给 AI（零配置）

任意菜谱页右下角工具栏 **「AI」**：一键复制「提示词 + 正文」到剪贴板，粘贴到 **任意聊天模型**（网页或 App）即可问答，**无需 API Key、无需 MCP**。

### 2. 公开 API / Skills（HTTP 只读）

| 能力 | 说明 |
|------|------|
| **JSON 索引** | `/recipes-index.json`、`/stats.json`、`/pantry.json`、`/recent.json` |
| **OpenAPI** | [/openapi.json](https://cook.alexander.xin/openapi.json) — 任意能读 OpenAPI 的 Agent 可直接调用 |
| **Agent Skills** | [/.well-known/agent-skills/](https://cook.alexander.xin/.well-known/agent-skills/index.json) |
| **Markdown 镜像** | Docker 部署下对页面请求 `Accept: text/markdown` 获取正文 |
| **auth.md** | [/auth.md](/auth.md) — 匿名只读访问说明 |

适合：自定义脚本、LangChain / AutoGen、Cloudflare Agents、Codex CLI 等通过 HTTP 拉数据的场景。

### 3. MCP Server（工具调用，可选）

[MCP](https://modelcontextprotocol.io/) 是跨客户端的开放协议。MyCook 提供 **8 个只读 tools + 2 prompts**，同一套服务可被多种 IDE / 桌面客户端共用。

先准备数据：

```bash
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook && npm install && npm run generate
```

**本地 stdio**（客户端启动子进程）：

```bash
npm run mcp
```

将 [mcp/mcp-config.example.json](https://github.com/AlexanderJ-Carter/MyCook/blob/main/mcp/mcp-config.example.json) 中的 `mycook` 段合并进你的 MCP 配置，修改 `cwd` 与 `MYCOOK_DATA` 为实际路径。

**远程 HTTP**（独立 sidecar，任意支持 URL 的 MCP 客户端）：

```bash
npm run mcp:http
# → http://127.0.0.1:3001/mcp
```

配置示例见 [mcp/mcp-http.example.json](https://github.com/AlexanderJ-Carter/MyCook/blob/main/mcp/mcp-http.example.json)。

Docker：`docker compose --profile agent up -d --build`（站点 `:8080`，MCP `:3001/mcp`）。

## 常见 MCP 客户端

配置格式均为 JSON 里的 `mcpServers`，仅**文件位置 / 设置入口**不同：

| 客户端 | 配置入口 |
|--------|----------|
| **Cursor** | Settings → MCP，或用户目录 `mcp.json` |
| **Claude Desktop** | macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`；Windows：`%APPDATA%\Claude\claude_desktop_config.json` |
| **VS Code / GitHub Copilot** | 工作区 `.vscode/mcp.json` 或 Copilot MCP 设置 |
| **Windsurf** | Windsurf MCP 设置（Codeium） |
| **Cline** | Cline 扩展 → MCP Servers |
| **Continue** | `~/.continue/config.json` 中的 MCP 段 |
| **Zed / JetBrains AI** | 各产品 MCP 插件配置 |
| **任意 HTTP 客户端** | `"url": "http://host:3001/mcp"` |

合并 [mcp-config.example.json](https://github.com/AlexanderJ-Carter/MyCook/blob/main/mcp/mcp-config.example.json) 后，对 Agent 说例如：「用 mycook 搜一下番茄鸡蛋相关菜谱」。

完整工具列表与架构见仓库 [MCP.md](https://github.com/AlexanderJ-Carter/MyCook/blob/main/MCP.md)。

## WebMcp（浏览器内）

支持 [WebMCP](https://github.com/webmachinelearning/webmcp) 的浏览器会在访问本站时自动注册同名工具（`WebMcp.vue`），页面内 Agent 可直接搜索、随机选菜，无需本地 MCP 进程。

## 工具一览

`search_recipes` · `get_recipe` · `get_recipe_markdown` · `get_site_stats` · `get_recent_updates` · `search_by_ingredients` · `list_pantry_ingredients` · `random_recipe` · `search_tips`

Prompts：`what_to_cook` · `recipe_assistant`

## 维护者

- [AGENTS.md](/AGENTS.md) — 仓库结构与贡献约定
- [INTEGRATIONS.md](https://github.com/AlexanderJ-Carter/MyCook/blob/main/INTEGRATIONS.md) — 上游数据集成
