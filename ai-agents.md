---
title: AI Agent 与 MCP
description: MyCook 面向 AI 代理的发现端点、远程 MCP 鉴权与使用指南
---

# AI Agent 与 MCP

MyCook 不只是给人看的菜谱站，也是给 **AI Agent** 读的厨房知识库。接入方式与具体客户端无关——ChatGPT、Claude、Gemini、Copilot、Cursor、自建 Agent 均可。

## 三个入口怎么选

| 入口 | 域名 | 用途 |
|------|------|------|
| **Pages 主站** | [cook.alexander.xin](https://cook.alexander.xin) | 公开 JSON / OpenAPI / Skills，**无需登录** |
| **完整站** | [mycook.alexander.xin](https://mycook.alexander.xin) | 同上能力 + HowToCook 图片版 + Markdown 协商 |
| **远程 MCP** | [cook-mcp.alexander.xin](https://cook-mcp.alexander.xin/mcp) | 工具调用；**必须** Bearer（Pocket ID JWT 或 API Key） |

日常给人看、脚本拉 JSON → 用 `cook`。要步骤图或 Docker 侧能力 → 用 `mycook`。要 Agent 调 tools → 用 `cook-mcp`。

**手把手连远程 MCP（含 Pocket ID / API Key）：** 见独立页 [MCP 使用指南](/mcp-guide)。

## 三种用法（按门槛从低到高）

### 1. 复制给 AI（零配置）

任意菜谱页工具栏 **「AI」**：一键复制「提示词 + 正文」，粘贴到任意聊天模型即可，**无需 API Key、无需 MCP**。

### 2. 公开 API / Skills（HTTP 只读）

| 能力 | 说明 |
|------|------|
| **JSON 索引** | `/recipes-index.json`、`/stats.json`、`/pantry.json`、`/recent.json` |
| **OpenAPI** | [/openapi.json](https://cook.alexander.xin/openapi.json) |
| **Agent Skills** | [/.well-known/agent-skills/](https://cook.alexander.xin/.well-known/agent-skills/index.json) |
| **Markdown 镜像** | 完整站 / Docker 下对页面请求 `Accept: text/markdown` |
| **访问策略** | [/auth.md](/auth.md) — 公开资源匿名；远程 MCP 另述 |

### 3. MCP Server（工具调用）

[MCP](https://modelcontextprotocol.io/) 提供 **8 个只读 tools + 2 prompts**。

#### A. 远程 HTTP（推荐自托管）

端点：`https://cook-mcp.alexander.xin/mcp`

1. 在 [Pocket ID](https://id.alexander.xin) 为该资源申请访问（API resource = `https://cook-mcp.alexander.xin/mcp`，权限 `mycook:read`），或使用管理员下发的静态 API Key。
2. 客户端配置示例（[mcp-http.example.json](https://github.com/AlexanderJ-Carter/MyCook/blob/main/mcp/mcp-http.example.json)）：

```json
{
  "mcpServers": {
    "mycook-remote": {
      "url": "https://cook-mcp.alexander.xin/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

3. 探测：`GET https://cook-mcp.alexander.xin/health`（无需 token，返回 `auth` 摘要）。  
   元数据：`/.well-known/oauth-protected-resource`。

无 Bearer 调用 `/mcp` 会得到 **401** 与 `WWW-Authenticate`。

#### B. 本地 stdio

```bash
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook && npm install && npm run generate
npm run mcp
```

合并 [mcp-config.example.json](https://github.com/AlexanderJ-Carter/MyCook/blob/main/mcp/mcp-config.example.json)，改 `cwd` / `MYCOOK_DATA`。本地 stdio **不走** Pocket ID。

#### C. 本机 HTTP（开发）

```bash
AUTH_REQUIRED=0 npm run mcp:http
# → http://127.0.0.1:3001/mcp
```

## 常见 MCP 客户端

| 客户端 | 配置入口 |
|--------|----------|
| **Cursor** | Settings → MCP，或用户目录 `mcp.json` |
| **Claude Desktop** | macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`；Windows：`%APPDATA%\Claude\claude_desktop_config.json` |
| **VS Code / Copilot** | 工作区 `.vscode/mcp.json` |
| **Windsurf / Cline / Continue** | 各扩展 MCP 设置 |
| **任意 HTTP 客户端** | `"url"` + `Authorization` header |

对 Agent 说例如：「用 mycook 搜一下番茄鸡蛋相关菜谱」。

完整工具列表见仓库 [MCP.md](https://github.com/AlexanderJ-Carter/MyCook/blob/main/MCP.md)。

## WebMcp（浏览器内）

支持 [WebMCP](https://github.com/webmachinelearning/webmcp) 的浏览器访问本站时会注册同名工具，无需本地 MCP 进程。

## 工具一览

`search_recipes` · `get_recipe` · `get_recipe_markdown` · `get_site_stats` · `get_recent_updates` · `search_by_ingredients` · `list_pantry_ingredients` · `random_recipe` · `search_tips`

Prompts：`what_to_cook` · `recipe_assistant`

## 维护者

- [AGENTS.md](/AGENTS.md)
- [INTEGRATIONS.md](https://github.com/AlexanderJ-Carter/MyCook/blob/main/INTEGRATIONS.md)
