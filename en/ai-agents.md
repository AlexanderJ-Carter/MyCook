---
title: AI Agents & MCP
description: Discovery endpoints, remote MCP auth, and how to use MyCook from any agent
---

# AI Agents & MCP

MyCook is a kitchen knowledge base for people and for **AI agents**. Any host works — ChatGPT, Claude, Gemini, Copilot, Cursor, or a custom agent.

## Three public hosts

| Host | Domain | Use |
|------|--------|-----|
| **Pages** | [cook.alexander.xin](https://cook.alexander.xin) | Public JSON / OpenAPI / Skills — **no login** |
| **Full site** | [mycook.alexander.xin](https://mycook.alexander.xin) | Same + HowToCook images + Markdown negotiation |
| **Remote MCP** | [cook-mcp.alexander.xin](https://cook-mcp.alexander.xin/mcp) | Tool calls — **Bearer required** (Pocket ID JWT or API key) |

Browse & script JSON → `cook`. Need step photos → `mycook`. Agent tools → `cook-mcp`.

**One-line MCP setup for your assistant:** [mcp-setup](/en/mcp-setup).

## Three ways to use it

### 1. Copy for AI (zero setup)

Recipe toolbar **AI** copies prompt + body into any chat model. No API key, no MCP.

To install remote MCP, paste:

```text
Follow https://cook.alexander.xin/mcp-setup and wire up MyCook MCP; then call search_recipes with query "tomato".
```

### 2. Public HTTP APIs / Skills

| Capability | Notes |
|------------|--------|
| JSON indexes | `/recipes-index.json`, `/stats.json`, `/pantry.json`, `/recent.json` |
| OpenAPI | [/openapi.json](https://cook.alexander.xin/openapi.json) |
| Agent Skills | [/.well-known/agent-skills/](https://cook.alexander.xin/.well-known/agent-skills/index.json) |
| Markdown | On the full host / Docker: `Accept: text/markdown` |
| Policy | [/auth.md](/auth.md) |

### 3. MCP Server

#### A. Remote HTTP (self-hosted)

Endpoint: `https://cook-mcp.alexander.xin/mcp`

1. Get access via [Pocket ID](https://id.alexander.xin) (API resource = that URL, scope `mycook:read`) or a static API key.
2. Client config ([example](https://github.com/AlexanderJ-Carter/MyCook/blob/main/mcp/mcp-http.example.json)):

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

3. Probe: `GET /health` (no token). Metadata: `/.well-known/oauth-protected-resource`.

#### B. Local stdio

```bash
npm install && npm run generate && npm run mcp
```

Merge [mcp-config.example.json](https://github.com/AlexanderJ-Carter/MyCook/blob/main/mcp/mcp-config.example.json). Stdio does **not** use Pocket ID.

#### C. Local HTTP (dev)

```bash
AUTH_REQUIRED=0 npm run mcp:http
```

## Clients

Cursor · Claude Desktop · VS Code Copilot · Windsurf · Cline · Continue — same `mcpServers` JSON shape; only the file path differs.

See [MCP.md](https://github.com/AlexanderJ-Carter/MyCook/blob/main/MCP.md) for the full tool list.

## Tools

`search_recipes` · `get_recipe` · `get_recipe_markdown` · `get_site_stats` · `get_recent_updates` · `search_by_ingredients` · `list_pantry_ingredients` · `random_recipe` · `search_tips`

Prompts: `what_to_cook` · `recipe_assistant`
