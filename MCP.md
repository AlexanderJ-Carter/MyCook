# MyCook MCP 与 AI Agent

MyCook 面向 AI Agent 提供三层能力，**静态站点不因此变胖**——MCP 是可选 sidecar，默认 Pages 部署零 Node 运行时。

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

## 方式一：Cursor / Claude Desktop（stdio，推荐本地）

先构建数据：

```bash
npm run generate
```

将 [mcp/cursor-mcp.example.json](./mcp/cursor-mcp.example.json) 合并进 Cursor MCP 配置，把 `cwd` 和 `MYCOOK_DATA` 改成你的仓库路径。

或在项目根：

```bash
npm run mcp
```

## 方式二：HTTP Streamable MCP（远程 Agent）

```bash
npm run generate
npm run mcp:http
# → http://127.0.0.1:3001/mcp
```

Cursor 远程 MCP 配置示例：

```json
{
  "mcpServers": {
    "mycook-remote": {
      "url": "http://127.0.0.1:3001/mcp"
    }
  }
}
```

## 方式三：Docker Compose（agent profile）

与静态站同数据卷，单独端口暴露 MCP：

```bash
docker compose --profile agent up -d --build
# 站点 → :8080    MCP → :3001/mcp
```

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

## Prompts

| 名称 | 用途 |
|------|------|
| `what_to_cook` | 「今天吃什么」检索 + 推荐 |
| `recipe_assistant` | 单篇菜谱问答上下文 |

## 发现端点（无需 MCP 也能用）

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

菜谱页工具栏 **「发给 AI」**：复制「系统提示 + 正文」到剪贴板，粘贴到任意聊天模型即可。

浏览器支持 [WebMCP](https://github.com/webmachinelearning/webmcp) 时，页面自动注册同名工具（`WebMcp.vue`）。

## 设计原则

- **只读**：不提供写菜谱、无用户数据上传
- **无 LLM 内置**：不在服务端调用 OpenAI，Agent 自带模型
- **数据同源**：MCP 读 `public/` 与静态站一致
- **可选部署**：Pages 纯静态；需要 Agent 时再启 MCP sidecar

详见 [INTEGRATIONS.md](./INTEGRATIONS.md) · [AGENTS.md](./AGENTS.md)
