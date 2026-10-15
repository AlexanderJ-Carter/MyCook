# MCP 目录提交素材

> 给 mcp.so / Glama / Smithery / PulseMCP 等目录提交 MyCook MCP Server 用的现成素材。
> 提交入口（需账号，手动操作）：
> - mcp.so：https://mcp.so → Submit Server
> - Glama：https://glama.ai/mcp/servers → Submit
> - Smithery：https://smithery.ai → Publish（走 CLI）
> - PulseMCP：https://www.pulsemcp.com → Submit

## 一句话简介（英文）

```
A kitchen toolbox for AI agents: search 709 Chinese home recipes, read full
Markdown recipe bodies, match dishes to what's in your fridge, and get
random picks or cooking tips.
```

## 短描述（≤100 字符，列表卡片用）

```
709 Chinese home recipes for AI agents — search, read, fridge-match.
```

## 长描述（英文，详情页用）

```
MyCook MCP gives AI agents a complete Chinese home-cooking knowledge base:

- search_recipes — keyword search across 709 recipes with spoken-name aliases
  (番茄炒蛋 → 西红柿炒鸡蛋)
- get_recipe / get_recipe_markdown — full recipe bodies in Markdown, precise
  to grams and seconds
- search_by_ingredients — "what can I make with eggs and tomatoes?" fridge
  matching (599 ingredient pairs)
- random_recipe — daily "what to eat" inspiration
- search_tips — kitchen technique notes (oil temperature, knife skills…)
- get_site_stats / get_recent_updates — site overview and fresh recipes

The site itself (https://cook.alexander.xin) is an installable PWA with a
browser kitchen assistant; the MCP server exposes the same data to any MCP
client. Content syncs daily from HowToCook and CookLikeHOC open-source
projects.

Remote endpoint: https://cook-mcp.alexander.xin/mcp (Bearer token required)
Local stdio: clone the repo and `npm run mcp` — no auth, no network.
```

## 服务器信息

| 字段 | 值 |
|------|-----|
| Name | `mycook` |
| Display name | MyCook Recipe Discovery |
| Endpoint | `https://cook-mcp.alexander.xin/mcp` |
| Transport | Streamable HTTP（也支持 stdio 本地跑） |
| Auth | Bearer（Pocket ID JWT 或静态 API Key）；本地 stdio 免鉴权 |
| Health | `https://cook-mcp.alexander.xin/health` |
| Repo | https://github.com/AlexanderJ-Carter/MyCook |
| Website | https://cook.alexander.xin |
| License | MIT |
| Language | Node.js ≥ 18 |
| Tags | recipes, cooking, chinese, kitchen, food, search |

## 图标

用 `public/logo.svg`（SVG）或 `docs/screenshots/social-card.png`（1280×640）。

## 客户端配置 JSON（远程）

```json
{
  "mcpServers": {
    "mycook": {
      "url": "https://cook-mcp.alexander.xin/mcp",
      "headers": { "Authorization": "Bearer YOUR_TOKEN" }
    }
  }
}
```

## 客户端配置 JSON（本地 stdio，免鉴权）

```json
{
  "mcpServers": {
    "mycook": {
      "command": "node",
      "args": ["mcp/server.mjs"],
      "cwd": "/path/to/MyCook",
      "env": { "MYCOOK_DATA": "/path/to/MyCook/public" }
    }
  }
}
```

## 9 个工具速览（可直接贴进提交表）

| Tool | Description |
|------|-------------|
| search_recipes | Keyword search with spoken-name aliases |
| get_recipe | Recipe metadata by path |
| get_recipe_markdown | Full recipe body in Markdown |
| get_site_stats | Category statistics |
| get_recent_updates | Recently synced recipes |
| search_by_ingredients | Match dishes to ingredients on hand |
| list_pantry_ingredients | Available ingredient chips |
| random_recipe | Random dish for today |
| search_tips | Kitchen technique notes |

## 自检命令（审核常跑这个）

```bash
curl -s https://cook-mcp.alexander.xin/health
# → {"ok":true,...}

curl -s https://cook.alexander.xin/recipes-index.json | head -c 200
# → {"total":709,...}
```
