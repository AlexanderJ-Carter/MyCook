---
title: 一句话接入 MCP
description: 复制一段话发给 AI 助手，即可配置 MyCook 远程 MCP
---

# 一句话接入 MCP

像主流远程 MCP 一样：**复制下面这段发给 AI 助手**，让它帮你写好配置并自检。

## 复制发给 AI

```text
请按 https://cook.alexander.xin/mcp-setup.md 帮我接入 MyCook MCP；配好后用 search_recipes 搜「番茄」自检。
```

更完整的说明书（给 Agent 直接读）也在同一地址：[/mcp-setup.md](/mcp-setup.md)。人类分步说明见 [MCP 使用指南](/mcp-guide)。

## Cursor 一键安装

1. 准备好 Bearer 令牌（管理员发的 API Key，或 Pocket ID JWT）。
2. 点击安装（打开后把配置里的 `YOUR_TOKEN` 改成真令牌再批准）：

<a class="primary" href="cursor://anysphere.cursor-deeplink/mcp/install?name=mycook&config=eyJ1cmwiOiJodHRwczovL2Nvb2stbWNwLmFsZXhhbmRlci54aW4vbWNwIiwiaGVhZGVycyI6eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIFlPVVJfVE9LRU4ifX0">在 Cursor 中添加 MyCook MCP</a>

若点击无反应：先打开一次 Cursor，再点链接；或手动把下面 JSON 合并进 Settings → MCP。

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

## 配好后怎么用

对 Agent 说例如：

- 「用 mycook 搜番茄鸡蛋」
- 「开冰箱：番茄、鸡蛋、葱」
- 「随机一道菜并读完整步骤」

Agent 会走 Skill 编排（搜 → 读 Markdown → 给可点链接）。技能索引：[/.well-known/agent-skills/](https://cook.alexander.xin/.well-known/agent-skills/index.json)。

## 还没有令牌？

见 [MCP 使用指南 · 准备令牌](/mcp-guide)。公开 JSON（`/recipes-index.json`）不需要令牌，也不需要 MCP。
