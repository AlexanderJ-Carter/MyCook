---
title: AI Agents & MCP
description: MyCook discovery endpoints, MCP server, and integration guide for any AI client
---

# AI Agents & MCP

MyCook is a kitchen knowledge base for **humans and AI agents alike** — not tied to Cursor or any single product.

## Three ways to integrate (lowest effort first)

### 1. Copy for AI (zero setup)

On any recipe page, tap **AI** in the toolbar to copy a prompt + full recipe text. Paste into ChatGPT, Claude, Gemini, or any chat model — **no API key required**.

### 2. Public HTTP / Skills (read-only)

| Asset | URL |
|-------|-----|
| Recipe index | `/recipes-index.json` |
| Stats | `/stats.json` |
| Pantry | `/pantry.json` |
| OpenAPI | [/openapi.json](https://cook.alexander.xin/openapi.json) |
| Agent Skills | [/.well-known/agent-skills/](https://cook.alexander.xin/.well-known/agent-skills/index.json) |
| Access policy | [/auth.md](/auth.md) |

Works with custom scripts, LangChain, Cloudflare Agents, Codex CLI, etc.

### 3. MCP Server (optional tools)

[MCP](https://modelcontextprotocol.io/) exposes 8 read-only tools + 2 prompts. Same server works across clients:

```bash
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook && npm install && npm run generate
npm run mcp        # stdio
npm run mcp:http   # http://127.0.0.1:3001/mcp
```

Merge [`mcp/mcp-config.example.json`](https://github.com/AlexanderJ-Carter/MyCook/blob/main/mcp/mcp-config.example.json) into your client config.

| Client | Where to configure |
|--------|-------------------|
| Cursor | Settings → MCP |
| Claude Desktop | `claude_desktop_config.json` |
| VS Code Copilot | `.vscode/mcp.json` |
| Windsurf / Cline / Continue | MCP section in extension settings |
| Any HTTP client | `"url": "http://host:3001/mcp"` |

Full details: [MCP.md](https://github.com/AlexanderJ-Carter/MyCook/blob/main/MCP.md)

## Tools

`search_recipes` · `get_recipe` · `get_recipe_markdown` · `get_site_stats` · `get_recent_updates` · `search_by_ingredients` · `list_pantry_ingredients` · `random_recipe` · `search_tips`

Prompts: `what_to_cook` · `recipe_assistant`

## WebMcp

Browsers with [WebMCP](https://github.com/webmachinelearning/webmcp) register the same tools automatically when you visit the site.
