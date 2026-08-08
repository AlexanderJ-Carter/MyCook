# MyCook MCP 与 AI Agent

MyCook 面向 **任意 AI Agent** 提供三层能力（不限于 Cursor）。MCP 是可选 sidecar，默认 GitHub Pages 部署零 Node 运行时。

## 域名分工

| 域名 | 托管 | 用途 |
|------|------|------|
| `cook.alexander.xin` | GitHub Pages | 主站 CDN，公开 JSON / Skills |
| `mycook.alexander.xin` | SSH cloud（`:full`） | 完整站 + 图片版 |
| `cook-mcp.alexander.xin` | SSH cloud MCP | 远程工具调用（Bearer） |

生产 compose 见 [`deploy/cloud`](./deploy/cloud)。站点使用说明见 [/ai-agents](https://cook.alexander.xin/ai-agents)。

## 架构

```
┌─────────────────────────────────────────────────────────┐
│  静态站点（GitHub Pages / nginx Docker）                 │
│  · JSON API（recipes-index / stats / pantry）           │
│  · Markdown 镜像 + Accept 协商（Docker nginx）           │
│  · .well-known 发现（OpenAPI / Skills / MCP Card）      │
│  · WebMcp（浏览器内 document.modelContext 工具）         │
└─────────────────────────────────────────────────────────┘
                              │
         可选 sidecar          ▼
┌─────────────────────────────────────────────────────────┐
│  MCP Server（stdio 或 HTTP :3001）                       │
│  · 8 个只读 tools + 2 prompts + 资源索引                 │
│  · 读本地 public/ 或挂载 dist，无 LLM 密钥               │
└─────────────────────────────────────────────────────────┘
```

## 方式一：本地 stdio（IDE / 桌面客户端）

先构建数据：

```bash
npm run generate
```

将 [mcp/mcp-config.example.json](./mcp/mcp-config.example.json) 里的 `mycook` 段合并进你的 MCP 配置，把 `cwd` 和 `MYCOOK_DATA` 改成仓库路径。

或在项目根直接调试：

```bash
npm run mcp
```

### 各客户端配置位置

| 客户端 | 说明 |
|--------|------|
| **Cursor** | Settings → MCP |
| **Claude Desktop** | `claude_desktop_config.json`（见 [ai-agents.md](./ai-agents.md) 路径表） |
| **VS Code Copilot** | `.vscode/mcp.json` |
| **Windsurf / Cline / Continue** | 各扩展 MCP 设置，JSON 结构相同 |
| **其他** | 凡支持 MCP stdio 的客户端，填入 `command` + `args` + `env` 即可 |

## 方式二：HTTP Streamable MCP（远程 / 多客户端共享）

```bash
npm run generate
npm run mcp:http
# → http://127.0.0.1:3001/mcp
```

任意支持 **MCP over HTTP** 的客户端使用 [mcp/mcp-http.example.json](./mcp/mcp-http.example.json)。

生产（如 `https://cook-mcp.alexander.xin`）默认 **鉴权开启**：

| 方式 | 说明 |
|------|------|
| Pocket ID JWT | `Authorization: Bearer <access_token>`；`aud` = `{MCP_PUBLIC_URL}/mcp`；scope `mycook:read` |
| 静态 API Key | 环境变量 `MCP_API_KEYS`（逗号分隔），同样走 Bearer |
| 关闭鉴权 | 仅本地：`AUTH_REQUIRED=0` |

元数据：`/.well-known/oauth-protected-resource`、`GET /health`（含 `auth` 摘要，不要求 token）。

适合：Claude Desktop 远程、团队共用 sidecar、自建 Agent 网关。

## 方式三：Docker Compose（agent profile）

与静态站同数据卷，单独端口暴露 MCP：

```bash
docker compose --profile agent up -d --build
# 站点 → :8080    MCP → :3001/mcp
```

## 不用 MCP 时

- **菜谱页「AI」按钮**：复制提示词 + 正文到任意聊天模型
- **OpenAPI / JSON**：[/openapi.json](https://cook.alexander.xin/openapi.json)、`/recipes-index.json`
- **Agent Skills**：`/.well-known/agent-skills/index.json`

详见站点 [/ai-agents](https://cook.alexander.xin/ai-agents)。

## MCP Tools

| 工具 | 说明 |
|------|------|
| `search_recipes` | 按关键词搜索站内菜谱 |
| `get_recipe` | 路径 → 元数据 |
| `get_recipe_markdown` | 路径 → 完整 Markdown |
| `get_site_stats` | 分类统计 |
| `get_recent_updates` | 最近更新 |
| `search_by_ingredients` | 食材反查（食用手册数据） |
| `list_pantry_ingredients` | 可选食材 chip |
| `random_recipe` | 随机一道 |
| `search_tips` | 搜索厨房技巧 |

## Prompts

| 名称 | 用途 |
|------|------|
| `what_to_cook` | 「今天吃什么」检索 + 推荐 |
| `recipe_assistant` | 单篇菜谱问答上下文 |

## 发现端点

| 路径 | 说明 |
|------|------|
| `/.well-known/mcp/server-card.json` | MCP 服务卡片 |
| `/.well-known/agent-skills/` | Agent Skills 索引 |
| `/openapi.json` | OpenAPI 3.1 |
| `/auth.md` | 匿名只读访问说明 |
| `/recipes-index.json` | 全量索引 |

Docker 部署时携带 `Accept: text/markdown` 可获取菜谱 Markdown 镜像。

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `MYCOOK_DATA` | `./public` | JSON / Markdown 数据目录 |
| `SITE_URL` | `https://cook.alexander.xin` | 生成链接用 |
| `MCP_PORT` | `3001` | HTTP 模式端口 |
| `MCP_URL` | `{SITE_URL}/mcp` | 写入 server-card（自托管可改） |

## 前端 AI 辅助（无 API Key）

菜谱页工具栏 **「AI」**：复制「系统提示 + 正文」到剪贴板，粘贴到 ChatGPT / Claude / Gemini / 本地模型等均可。

浏览器支持 [WebMCP](https://github.com/webmachinelearning/webmcp) 时，页面自动注册同名工具（`WebMcp.vue`）。

## 设计原则

- **只读**：不提供写菜谱、无用户数据上传
- **无 LLM 内置**：不在服务端调用 OpenAI，Agent 自带模型
- **客户端无关**：MCP / OpenAPI / 剪贴板，不绑定单一产品
- **数据同源**：MCP 读 `public/` 与静态站一致
- **可选部署**：Pages 纯静态；需要 Agent 时再启 MCP sidecar

详见 [INTEGRATIONS.md](./INTEGRATIONS.md) · [AGENTS.md](./AGENTS.md) · [ai-agents.md](./ai-agents.md)
