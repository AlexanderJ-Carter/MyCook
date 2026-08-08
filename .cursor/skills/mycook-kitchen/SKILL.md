---
name: mycook-kitchen
description: >-
  Use MyCook to search recipes, read full Markdown steps, reverse-lookup by
  pantry ingredients, pick a random dish, or fetch kitchen tips. Prefer MCP
  tools when available; fall back to public JSON. Trigger for cooking,
  recipes, 菜谱, 今天吃什么, 开冰箱, 番茄鸡蛋, MyCook.
---

# MyCook Kitchen

帮用户查菜、选菜、按手头食材推荐。优先用 **MCP tools**；没有 MCP 时再拉公开 JSON。

## 域名

| 用途 | URL |
|------|-----|
| 公开站 / Skills | https://cook.alexander.xin |
| 完整站 + 图片 | https://mycook.alexander.xin |
| 远程 MCP | https://cook-mcp.alexander.xin/mcp |
| 一句话接入 | https://cook.alexander.xin/mcp-setup |

## 优先：MCP 工具编排

已连接 `mycook` MCP 时按场景调用（只读，无副作用）：

| 用户意图 | 调用顺序 |
|----------|----------|
| 搜菜名 / 关键词 | `search_recipes` → 选一道 → `get_recipe_markdown` |
| 开冰箱 / 手头有什么 | `list_pantry_ingredients`（可选）→ `search_by_ingredients` → `get_recipe_markdown` |
| 今天吃什么 / 随便做 | `random_recipe` 或 prompt `what_to_cook` → `get_recipe_markdown` |
| 问技巧 / 备忘 | `search_tips` |
| 站有多大 / 最近更新 | `get_site_stats` / `get_recent_updates` |

规则：
1. 先搜索再读全文，不要猜步骤。
2. 路径用站内 path（如 `/cooklikehoc/炒菜/鱼香肉丝`），不要编造。
3. 回答里给可点开的完整链接：`https://cook.alexander.xin<path>`；要步骤大图用 `https://mycook.alexander.xin/howtocook-images/`。
4. `source`：`cooklikehoc` = 做法库，`howtocook` = 食材指南。
5. 远程 MCP 需 Bearer；401 时提示用户打开 https://cook.alexander.xin/mcp-setup。

## 回落：公开 HTTP（无需登录）

```
GET https://cook.alexander.xin/recipes-index.json
GET https://cook.alexander.xin/stats.json
GET https://cook.alexander.xin/recent.json
GET https://cook.alexander.xin/pantry.json
GET https://cook.alexander.xin/openapi.json
```

完整站可用 `Accept: text/markdown` 拉菜谱 Markdown。

## 鉴权边界

- 公开 JSON / Skills / 本页：匿名
- `https://cook-mcp.alexander.xin/mcp`：`Authorization: Bearer …`（Pocket ID JWT 或 API Key）
- 策略：https://cook.alexander.xin/auth.md
