---
title: One-line MCP setup
description: Paste one message to your AI assistant to wire up MyCook remote MCP
---

# One-line MCP setup

Like mainstream remote MCPs: **paste the line below to your AI assistant** and let it write the config + smoke-test.

## Paste to AI

```text
Follow https://cook.alexander.xin/en/mcp-setup and https://cook.alexander.xin/mcp-setup.md to connect MyCook MCP; then call search_recipes with query "tomato" to verify.
```

Full agent instructions: [/mcp-setup.md](/mcp-setup.md). Human walkthrough: [MCP guide](/en/mcp-guide).

## Cursor one-click

1. Get a Bearer token (static API key or Pocket ID JWT).
2. Open the install link and replace `YOUR_TOKEN` before approving:

<a class="primary" href="cursor://anysphere.cursor-deeplink/mcp/install?name=mycook&config=eyJ1cmwiOiJodHRwczovL2Nvb2stbWNwLmFsZXhhbmRlci54aW4vbWNwIiwiaGVhZGVycyI6eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIFlPVVJfVE9LRU4ifX0">Add MyCook MCP in Cursor</a>

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

## After it works

Try: “search tomato egg with mycook”, “pantry: tomato, egg”, “pick a random recipe and read the steps”.
