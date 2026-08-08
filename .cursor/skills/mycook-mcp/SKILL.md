---
name: mycook-mcp
description: >-
  Connect Cursor/Claude/VS Code to the MyCook remote MCP server, including
  Bearer token placement, Pocket ID resource scope, and a smoke-test search.
  Trigger when the user asks to install MyCook MCP, configure mcp.json, or
  fix 401 on cook-mcp.alexander.xin.
---

# MyCook MCP 接入

把远程 MCP 配进客户端，让 Agent 能调厨房工具。

## 一句话（给用户复制）

```
请按 https://cook.alexander.xin/mcp-setup 帮我接入 MyCook MCP；配好后用 search_recipes 搜「番茄」自检。
```

## 远程配置模板

合并进客户端 MCP 配置（把 `YOUR_TOKEN` 换成真实令牌）：

```json
{
  "mcpServers": {
    "mycook": {
      "url": "https://cook-mcp.alexander.xin/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

| 客户端 | 配置位置 |
|--------|----------|
| Cursor | Settings → MCP，或用户目录 `mcp.json` |
| Claude Desktop | macOS `~/Library/Application Support/Claude/claude_desktop_config.json`；Windows `%APPDATA%\\Claude\\claude_desktop_config.json` |
| VS Code | 工作区 `.vscode/mcp.json` |

Cursor 一键安装（仍需把 `YOUR_TOKEN` 改成真令牌后再批准）：  
`cursor://anysphere.cursor-deeplink/mcp/install?name=mycook&config=eyJ1cmwiOiJodHRwczovL2Nvb2stbWNwLmFsZXhhbmRlci54aW4vbWNwIiwiaGVhZGVycyI6eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIFlPVVJfVE9LRU4ifX0`

## 令牌

1. **API Key（最简单）**：运维下发的静态 Bearer，直接填。
2. **Pocket ID JWT**：resource=`https://cook-mcp.alexander.xin/mcp`，scope=`mycook:read`。换票必须带 `resource`（≥2.13）：

```bash
curl -sS -u 'mycook-mcp:$CLIENT_SECRET' \
  -d 'grant_type=client_credentials' \
  -d 'scope=mycook:read' \
  -d 'resource=https://cook-mcp.alexander.xin/mcp' \
  https://id.alexander.xin/api/oidc/token
```

探测（无需 token）：`GET https://cook-mcp.alexander.xin/health` → `ok: true`。

## 自检

配置生效后调用 `search_recipes`，query=`番茄`，应返回多条结果。失败见 https://cook.alexander.xin/mcp-guide。

## 本地免鉴权（开发）

```bash
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook && npm install && npm run generate
AUTH_REQUIRED=0 npm run mcp:http   # http://127.0.0.1:3001/mcp
# 或：npm run mcp  # stdio
```
