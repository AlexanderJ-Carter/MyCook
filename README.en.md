# MyCook 🍳

<p align="center">
  🌐 <a href="./README.md">简体中文</a> · <a href="./README.en.md">English</a> · <a href="./README.es-ES.md">Español</a>
</p>

> **Open the site, start cooking.** 709 Chinese home recipes in one place — ask "what should I eat today", match dishes to what's in your fridge, run multiple timers while cooking, and hand recipes to your AI.
>
> *一行中文：打开就能做饭——问一句厨助手、开冰箱按食材反查、PWA 可安装 + MCP Server。*

<p align="center">
  <a href="https://cook.alexander.xin">🍳 Try it live (no install)</a> ·
  <a href="#quick-start">Self-host</a> ·
  <a href="./MCP.md">Agent / MCP</a>
</p>

**Home · what to eat today / fridge matching / weekly plan**

![MyCook home](docs/screenshots/home-hero.png)

**Kitchen assistant: search-first cooking AI that answers with real recipe links**

![Kitchen assistant](docs/screenshots/assist-open.png)

**Recipe page: difficulty stars, grams and seconds, favorites / timers / print**

![Recipe page](docs/screenshots/recipe-page.png)

<p align="center">
  <a href="https://github.com/AlexanderJ-Carter/MyCook/actions/workflows/sync-and-build.yml"><img src="https://img.shields.io/github/actions/workflow/status/AlexanderJ-Carter/MyCook/sync-and-build.yml?branch=main&label=Pages&style=flat-square" alt="Pages"></a>
  <a href="https://github.com/AlexanderJ-Carter/MyCook/actions/workflows/docker.yml"><img src="https://img.shields.io/github/actions/workflow-status/AlexanderJ-Carter/MyCook/docker.yml?branch=main&label=Docker&style=flat-square" alt="Docker"></a>
  <a href="https://github.com/AlexanderJ-Carter/MyCook/actions/workflows/pr-check.yml"><img src="https://img.shields.io/github/actions/workflow/status/AlexanderJ-Carter/MyCook/pr-check.yml?branch=main&label=PR%20Check&style=flat-square" alt="PR Check"></a>
  <a href="https://github.com/AlexanderJ-Carter/MyCook/releases"><img src="https://img.shields.io/github/v/release/AlexanderJ-Carter/MyCook?style=flat-square&display_name=tag" alt="Release"></a>
  <a href="https://github.com/AlexanderJ-Carter/MyCook/blob/main/LICENSE"><img src="https://img.shields.io/github/license/AlexanderJ-Carter/MyCook?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node">
  <a href="https://github.com/AlexanderJ-Carter/MyCook/pkgs/container/mycook"><img src="https://img.shields.io/badge/GHCR-mycook-2496ED?style=flat-square&logo=docker&logoColor=white" alt="GHCR"></a>
</p>

---

## What is this?

[MyCook](https://cook.alexander.xin) merges two well-established open-source Chinese recipe projects into a single "kitchen desk", then adds everything a modern site should have: search, installable PWA, weekly meal planning, timers, and AI agents. Upstream recipes update daily — this site syncs and rebuilds automatically.

| Source | Browse by | Highlights |
|------|------|------|
| [CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC) | **Method** | stir-fry, braise, marinate, soups… detailed steps |
| [HowToCook](https://github.com/Anduin2017/HowToCook) | **Ingredient** | meat/veg/aquatic, difficulty stars, gram-and-second precision, tips |
| [HowToCook Images](https://github.com/king-jingxiang/HowToCook) | `/howtocook-images/` | 4K step photos (optional build) |
| [Cook pantry](https://github.com/YunYouJun/cook) | Fridge mode | lightweight ingredient CSV (~90 KB) |

Current scale: **709 recipes** · **18 technique notes** · **599 ingredient matches** (synced at build time)

> The UI is in Chinese (the recipes are Chinese home cooking, after all) — but everything is linkable, indexable, and agent-readable in plain URLs and JSON.

---

## Features

**Can't decide what to eat?**
- Ask the **kitchen assistant** (hotkey `A`): "what should I eat today" or "what can I make with eggs and tomatoes" — search-first, AI-polished, answers with clickable recipe links
- **Fridge mode**: check off what you have, get matching dishes (599 ingredient pairs)
- **Daily pick** (seeded per day) · random shuffle · **weekly meal planner**

**While cooking**
- Recipe pages ship with **favorites · multiple timers · print** (print styles tuned for the kitchen counter)
- Difficulty stars, steps precise to grams and seconds; `Ctrl+K` site search
- **Copy for AI**: one click packages the full recipe as a prompt — ask any chat AI about substitutions or heat

**Tinkerer?**
- **PWA** installs to your phone/desktop home screen, works offline
- **MCP Server**: Cursor / Claude Desktop / Copilot agents query recipes directly (`/mcp` + `/ask`)
- Dark mode · a11y shortcuts `?` · daily upstream sync · one-command Docker self-hosting

<details>
<summary>⚙️ Feature matrix</summary>

| Category | Capability |
|------|------|
| Find | site search `Ctrl+K` / `/` · three entry points · quick shelf |
| Play | **fridge matching** · random pick · **weekly plan** (localStorage) |
| Learn | **kitchen tips index** (HowToCook tips) |
| Cook | favorites · multi-timers · print · Bilibili video search · **copy-for-AI** |
| UX | dark mode · installable PWA · a11y shortcuts `?` |
| Agents | OpenAPI · Agent Skills · Markdown mirrors · **MCP Server** · WebMcp |
| Ops | daily upstream sync · GHCR images · one-line installer |

</details>

<details>
<summary>📂 Project structure</summary>

```
MyCook/
├── .github/workflows/     # CI: Pages / Docker / Release / PR
├── .vitepress/theme/      # Vue theme & home components
├── mcp/server.mjs         # MCP Server (stdio + HTTP)
├── scripts/               # sync, generate, validate, install
├── Dockerfile             # nginx + static dist (lite/full)
├── Dockerfile.mcp         # MCP sidecar (optional)
└── docker-compose.yml     # lite / full / dev / agent
```

Recipe content dirs `cooklikehoc/` and `howtocook/` are cloned from upstreams by CI, not committed.

</details>

---

## Quick start

### Use it online

- **[cook.alexander.xin](https://cook.alexander.xin)** — GitHub Pages CDN (lite)
- **[mycook.alexander.xin](https://mycook.alexander.xin)** — full site with 4K images
- **[cook-mcp.alexander.xin](https://cook-mcp.alexander.xin)** — kitchen assistant `/ask` + MCP (shared)

### Local development

```bash
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook && npm install

# needs CookLikeHOC / HowToCook checkouts in the parent dir (or set env paths)
npm run sync
npm run docs:dev          # http://localhost:5173
```

### Validate & build

```bash
npm run generate          # stats / index / tips / agent discovery
npm run validate          # smoke tests: JSON + MCP tools
npm run docs:build:fast   # fast build (skip image edition)
npm run docs:build        # full build (with images)
```

---

## Deployment

### GitHub Pages (recommended for forks)

1. Fork this repo
2. **Settings → Pages → Source** → **GitHub Actions**
3. Push to `main` → automatic **Sync & Build** deploy

### Docker (self-hosting / agents)

```bash
# fastest: pull the official lite image
./scripts/install.sh
# Windows: .\scripts\install.ps1

# or CLI
npm run mycook -- docker:pull
npm run mycook -- docker:lite     # build lite locally
npm run mycook -- docker:full     # with image edition
```

| Image | Tag | Notes |
|------|------|------|
| Site lite | `:latest` `:lite` | ~600 MB static site, recommended |
| Site full | `:full` | + image sub-site (manual Actions build) |
| MCP | `mycook-mcp:latest` | Streamable HTTP, `:3001/mcp` |

```bash
docker pull ghcr.io/alexanderj-carter/mycook:latest
docker run -d -p 8080:80 --name mycook ghcr.io/alexanderj-carter/mycook:latest

# optional MCP sidecar
docker compose --profile agent up -d --build
```

See [DOCKER.md](./DOCKER.md) · build manifest: `/image-manifest.json`

---

## Agent / MCP

Works with **any MCP client** (Cursor, Claude Desktop, Copilot, Windsurf, Cline…) plus HTTP/OpenAPI integrations:

```bash
npm run generate
npm run mcp          # stdio (merge mcp/mcp-config.example.json)
npm run mcp:http     # http://127.0.0.1:3001/mcp
```

| Capability | GitHub Pages | Docker |
|------|:---:|:---:|
| JSON / OpenAPI / Skills | ✅ | ✅ |
| `Accept: text/markdown` | ❌ | ✅ |
| MCP HTTP sidecar | ❌ | ✅ |

Docs: [MCP.md](./MCP.md) (Chinese) · [INTEGRATIONS.md](./INTEGRATIONS.md) · site page [/ai-agents](https://cook.alexander.xin/ai-agents)

---

## Sync mechanism

- **Automatic**: on push to `main` or daily at 10:00 (Beijing) — pulls latest recipes from upstreams
- **Manual**: Actions → **Sync & Build** → Run workflow
- **Fix a recipe**: push to the [CookLikeHOC](https://github.com/AlexanderJ-Carter/CookLikeHOC) / [HowToCook](https://github.com/AlexanderJ-Carter/HowToCook) forks; next sync picks it up
- **Fix the site**: contribute directly to this repo

---

## Acknowledgements

- [HowToCook](https://github.com/Anduin2017/HowToCook) — Anduin2017 and community
- [CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC) — Gar-b-age
- [HowToCook Images](https://github.com/king-jingxiang/HowToCook) — king-jingxiang
- [Cook pantry](https://github.com/YunYouJun/cook) — YunYouJun (MIT, CSV integration only)

## Contributors

- **[AlexanderJ-Carter](https://github.com/AlexanderJ-Carter)** — site, MCP, CI/CD
- **[WebBrain](https://github.com/webbrain-one)** — [Spanish README](./README.es-ES.md)
- This README was added with the help of Claude.

Full list on [GitHub Contributors](https://github.com/AlexanderJ-Carter/MyCook/graphs/contributors). Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) (Chinese).

## License

MIT License · recipe content © its original authors

## More

- [CHANGELOG.md](./CHANGELOG.md) · [GitHub Releases](https://github.com/AlexanderJ-Carter/MyCook/releases)
- [CONTRIBUTING.md](./CONTRIBUTING.md) · [AGENTS.md](./AGENTS.md) (maintainers, Chinese)
