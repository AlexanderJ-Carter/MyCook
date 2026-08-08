---
title: MCP 使用指南
description: 如何用 Cursor / Claude / Copilot 连接 MyCook 远程 MCP，以及 Pocket ID 鉴权步骤
---

# MCP 使用指南

把 MyCook 当成 Agent 的「厨房工具箱」：搜菜、读正文、按食材反查。本页只讲**怎么连上远程服务**。

## 一分钟分清三个地址

| 你要做什么 | 打开 |
|------------|------|
| 浏览器看菜谱 | [cook.alexander.xin](https://cook.alexander.xin)（Pages） |
| 看步骤大图 | [mycook.alexander.xin/howtocook-images/](https://mycook.alexander.xin/howtocook-images/) |
| 让 AI 调工具 | [cook-mcp.alexander.xin/mcp](https://cook-mcp.alexander.xin/mcp)（需登录令牌） |

公开 JSON（`/recipes-index.json` 等）**不用** MCP，也不用登录。只有调用 **MCP 工具** 才需要下面的 Bearer。

## 准备令牌（二选一）

### 方式 A：Pocket ID（推荐，多人可共享）

1. 管理员已在 [id.alexander.xin](https://id.alexander.xin) 建好 API：  
   resource = `https://cook-mcp.alexander.xin/mcp`，权限 `mycook:read`。
2. 用 OIDC 客户端 `mycook-mcp` 的 **client_credentials** 换 access token（运维脚本 / 网关常用），或让支持 OAuth 的 MCP 客户端走授权码流程。
3. 请求头：

```http
Authorization: Bearer <access_token>
```

令牌的 `aud` 必须是 `https://cook-mcp.alexander.xin/mcp`，`scope` 含 `mycook:read`。

### 方式 B：静态 API Key（个人脚本 / 备用）

运维在服务器 `MCP_API_KEYS` 里配置的一串密钥，同样放进 `Authorization: Bearer …`。  
**不要**把 Key 写进公开仓库或截图。

自检（无需 token）：

```bash
curl -sS https://cook-mcp.alexander.xin/health
```

应看到 `"ok": true` 和 `auth.required: true`。

## 客户端怎么填

把下面整段合并进你的 MCP 配置（Cursor / Claude Desktop / VS Code 等结构相同，只是文件位置不同）：

```json
{
  "mcpServers": {
    "mycook": {
      "url": "https://cook-mcp.alexander.xin/mcp",
      "headers": {
        "Authorization": "Bearer 换成你的令牌"
      }
    }
  }
}
```

| 客户端 | 配置放哪 |
|--------|----------|
| Cursor | Settings → MCP，或用户目录 `mcp.json` |
| Claude Desktop | macOS `~/Library/Application Support/Claude/claude_desktop_config.json`；Windows `%APPDATA%\Claude\claude_desktop_config.json` |
| VS Code Copilot | 工作区 `.vscode/mcp.json` |
| 其他 | 凡支持 MCP over HTTP 的，填 `url` + `headers` 即可 |

保存后重启客户端，对 Agent 说：「用 mycook 搜番茄鸡蛋」。

## 能调哪些工具

| 工具 | 用途 |
|------|------|
| `search_recipes` | 关键词搜菜 |
| `get_recipe` / `get_recipe_markdown` | 元数据 / 全文 |
| `search_by_ingredients` | 开冰箱式反查 |
| `random_recipe` | 随机一道 |
| `search_tips` | 厨房技巧 |
| `get_site_stats` / `get_recent_updates` | 统计与最近更新 |

Prompts：`what_to_cook`、`recipe_assistant`。

## 常见问题

**401 / Authentication required**  
没带 Bearer，或 JWT 的 `aud` / 过期时间不对。先 `curl /health`，再核对 token。

**连得上但搜不到菜**  
远程 MCP 读的是镜像内构建好的数据；确认服务健康后换关键词再试。

**只想本地用、不要鉴权**  
仓库里 `AUTH_REQUIRED=0 npm run mcp:http`，或 stdio：`npm run mcp`。见 [ai-agents](/ai-agents)。

**不想用 MCP**  
菜谱页工具栏「AI」一键复制正文；或直接拉公开 JSON。

## 相关链接

- [AI Agent 总览](/ai-agents)
- [访问策略 auth.md](/auth.md)
- 仓库 [MCP.md](https://github.com/AlexanderJ-Carter/MyCook/blob/main/MCP.md)
- Pocket ID：[id.alexander.xin](https://id.alexander.xin)
