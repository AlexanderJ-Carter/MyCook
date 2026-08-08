---
title: MCP guide
description: Connect Cursor / Claude / Copilot to the MyCook remote MCP with Pocket ID auth
---

# MCP guide

Use MyCook as a kitchen toolbox for agents: search, read recipes, match ingredients. This page is only about **connecting to the remote server**.

## Three hosts

| Goal | URL |
|------|-----|
| Browse recipes | [cook.alexander.xin](https://cook.alexander.xin) |
| Step photos | [mycook.alexander.xin/howtocook-images/](https://mycook.alexander.xin/howtocook-images/) |
| Agent tools | [cook-mcp.alexander.xin/mcp](https://cook-mcp.alexander.xin/mcp) (Bearer required) |

Public JSON needs **no** MCP and **no** login. Only MCP tool calls need a Bearer token.

## Get a token

**Pocket ID (recommended):** API resource `https://cook-mcp.alexander.xin/mcp`, scope `mycook:read`. Use client `mycook-mcp` with `client_credentials`, or an OAuth-capable MCP client. On Pocket ID ≥ 2.13, include `resource=https://cook-mcp.alexander.xin/mcp` when exchanging the token (RFC 8707), or `mycook:read` returns `invalid_scope`.

**Static API key:** set by ops in `MCP_API_KEYS`; same `Authorization: Bearer …` header.

```bash
curl -sS https://cook-mcp.alexander.xin/health
```

## Client config

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

Then ask: “use mycook to search for tomato and egg”.

Full tool list: [ai-agents](/en/ai-agents) · [auth.md](/auth.md).
