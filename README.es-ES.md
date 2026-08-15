# MyCook

<p align="center">
  🌐 <a href="./README.md">简体中文</a> · <a href="./README.es-ES.md">Español</a>
</p>

<p align="center">
  <strong>Recetario al estilo Lao Xiang Ji + guía de cocina para programadores — consulta, planifica y delega a la IA en un solo lugar</strong>
</p>

<p align="center">
  <a href="https://cook.alexander.xin">🍳 Acceso en línea</a> ·
  <a href="https://alexander.xin/projects">Página del autor</a> ·
  <a href="#inicio-rápido">Inicio rápido</a> ·
  <a href="#despliegue">Despliegue</a> ·
  <a href="./MCP.md">Agent / MCP</a>
</p>

<p align="center">
  <a href="https://github.com/AlexanderJ-Carter/MyCook/actions/workflows/sync-and-build.yml"><img src="https://img.shields.io/github/actions/workflow-status/AlexanderJ-Carter/MyCook/sync-and-build.yml?branch=main&label=Pages&style=flat-square" alt="Pages"></a>
  <a href="https://github.com/AlexanderJ-Carter/MyCook/actions/workflows/docker.yml"><img src="https://img.shields.io/github/actions/workflow-status/AlexanderJ-Carter/MyCook/docker.yml?branch=main&label=Docker&style=flat-square" alt="Docker"></a>
  <a href="https://github.com/AlexanderJ-Carter/MyCook/actions/workflows/pr-check.yml"><img src="https://img.shields.io/github/actions/workflow-status/AlexanderJ-Carter/MyCook/pr-check.yml?branch=main&label=PR%20Check&style=flat-square" alt="PR Check"></a>
  <a href="https://github.com/AlexanderJ-Carter/MyCook/releases"><img src="https://img.shields.io/github/v/release/AlexanderJ-Carter/MyCook?style=flat-square&display_name=tag" alt="Release"></a>
  <a href="https://github.com/AlexanderJ-Carter/MyCook/blob/main/LICENSE"><img src="https://img.shields.io/github/license/AlexanderJ-Carter/MyCook?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node">
  <a href="https://github.com/AlexanderJ-Carter/MyCook/pkgs/container/mycook"><img src="https://img.shields.io/badge/GHCR-mycook-2496ED?style=flat-square&logo=docker&logoColor=white" alt="GHCR"></a>
</p>

---

## ¿Qué es esto?

[MyCook](https://cook.alexander.xin) es un **sitio estático de recetas** dentro del conjunto de sitios de [alexander.xin](https://alexander.xin): combina dos proyectos open source maduros en una sola «mesa de cocina» y añade capacidades modernas como búsqueda, PWA, menú semanal y Agente de IA.

| Origen | Entrada | Característica |
|------|------|------|
| [CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC) | Por **método** | saltear, estofar, marinar, caldo… pasos detallados |
| [HowToCook](https://github.com/Anduin2017/HowToCook) | Por **ingrediente** | carne/verdura/pescado, dificultad por estrellas, técnicas |
| [HowToCook con imágenes](https://github.com/king-jingxiang/HowToCook) | `/howtocook-images/` | navegación con imágenes 4K (build opcional) |
| [Manual Cook](https://github.com/YunYouJun/cook) | Abrir la nevera | integración ligera de CSV de ingredientes (~90 KB) |

Escala actual: **577+ recetas** · **18 artículos de técnicas** · **599 ingredientes consultables** (sincronizados al construir).

---

## Funciones

| Categoría | Capacidad |
|------|------|
| Buscar recetas | Búsqueda en el sitio `Ctrl+K` / `/` · tres entradas · estante de acceso rápido |
| Jugar en la cocina | **Abrir nevera** (búsqueda inversa por ingrediente) · **Girar** (aleatorio) · **Menú semanal** (localStorage) |
| Aprender técnicas | **Consulta rápida de técnicas de cocina** (índice de tips de HowToCook) |
| Cocinar | Favoritos · múltiples temporizadores · imprimir · buscar vídeos en Bilibili · **copiar para la IA** |
| Experiencia | Modo oscuro · PWA instalable · atajos de accesibilidad `?` |
| Agent | OpenAPI · Agent Skills · espejo Markdown · **MCP Server** · WebMcp |
| Operaciones | Sincronización diaria con upstream · imágenes GHCR · script de instalación en un comando |

<details>
<summary>📂 Estructura del proyecto</summary>

```
MyCook/
├── .github/workflows/     # CI: Pages / Docker / Release / PR
├── .vitepress/theme/      # Tema Vue y componentes de la home
├── mcp/server.mjs         # MCP Server (stdio + HTTP)
├── scripts/               # sincronizar, generar, validar, instalar
├── Dockerfile             # nginx + dist estático (lite/full)
├── Dockerfile.mcp         # sidecar MCP (opcional)
└── docker-compose.yml     # lite / full / dev / agent
```

El contenido de las recetas (`cooklikehoc/`, `howtocook/`) se genera clonando upstream en CI y no se incluye en el repositorio.

</details>

---

## Inicio rápido

### Uso en línea

Accede directamente a **[cook.alexander.xin](https://cook.alexander.xin)** — sin instalación.

### Desarrollo local

```bash
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook && npm install

# Necesita CookLikeHOC / HowToCook en el directorio superior, o variables de entorno apuntando a las rutas
npm run sync
npm run docs:dev          # http://localhost:5173
```

### Validación y construcción

```bash
npm run generate          # stats / index / tips / descubrimiento de agentes
npm run validate          # smoke test de JSON + herramientas MCP
npm run docs:build:fast   # construcción rápida (omite la versión con imágenes)
npm run docs:build        # construcción completa (incluida la versión con imágenes)
```

---

## Despliegue

### GitHub Pages (recomendado para despliegue por Fork)

1. Haz Fork de este repositorio
2. En **Settings → Pages → Source** elige **GitHub Actions**
3. Sube a `main` → se publica automáticamente con **Sync & Build**

### Docker (autohospedaje / Agent)

```bash
# Lo más rápido: pull de la imagen lite oficial
./scripts/install.sh
# Windows: .\scripts\install.ps1

# O por CLI
npm run mycook -- docker:pull
npm run mycook -- docker:lite     # construir lite local
npm run mycook -- docker:full    # incluye la versión con imágenes
```

| Imagen | Etiqueta | Descripción |
|------|------|------|
| Sitio lite | `:latest` `:lite` | ~600 MB de sitio estático, recomendado para uso diario |
| Sitio full | `:full` | + subsitio con imágenes (build manual en Actions) |
| MCP | `mycook-mcp:latest` | Streamable HTTP, `:3001/mcp` |

```bash
docker pull ghcr.io/alexanderj-carter/mycook:latest
docker run -d -p 8080:80 --name mycook ghcr.io/alexanderj-carter/mycook:latest

# Sidecar MCP opcional
docker compose --profile agent up -d --build
```

Más detalles en [DOCKER.md](./DOCKER.md) · manifiesto de imágenes: `/image-manifest.json`

---

## CI / Flujo de publicación

| Workflow | Disparador | Función |
|--------|------|------|
| [Sync & Build](.github/workflows/sync-and-build.yml) | push a `main` · cron · manual | sincronizar → construir → Pages |
| [Docker](.github/workflows/docker.yml) | push tag `v*` · manual | construir y publicar imágenes GHCR |
| [Release](.github/workflows/release.yml) | push tag `v*` | crear GitHub Release |
| [PR Check](.github/workflows/pr-check.yml) | PR → `main` | comprobación de sintaxis · validate · build |

**Pasos de publicación** (mantenedores):

```bash
# 1. Actualizar la versión en package.json y CHANGELOG.md
# 2. Subir a main (despliega Pages automáticamente)
# 3. Crear el tag para disparar Release + imágenes Docker
git tag v1.6.1 && git push origin v1.6.1
```

---

## Agent / MCP

Para **cualquier cliente MCP** (Cursor, Claude Desktop, Copilot, Windsurf, Cline, etc.) e integraciones HTTP/OpenAPI:

```bash
npm run generate
npm run mcp          # stdio (fusiona mcp/mcp-config.example.json)
npm run mcp:http     # http://127.0.0.1:3001/mcp
```

| Capacidad | GitHub Pages | Docker |
|------|:------------:|:------:|
| JSON / OpenAPI / Skills | ✅ | ✅ |
| `Accept: text/markdown` | ❌ | ✅ |
| Sidecar MCP HTTP | ❌ | ✅ |

Documentación: [MCP.md](./MCP.md) · [INTEGRATIONS.md](./INTEGRATIONS.md) · sitio [/ai-agents](https://cook.alexander.xin/ai-agents)

---

## Variables de entorno

| Variable | Descripción |
|------|------|
| `COOKLIKEHOC_PATH` / `HOWTOCOOK_PATH` | Ruta local de los repositorios upstream |
| `SKIP_IMAGES=1` | Omitir la versión con imágenes |
| `SKIP_INTEGRATIONS=1` | Omitir la sincronización del CSV del manual Cook |
| `MYCOOK_DATA` | Directorio de datos del MCP (por defecto `./public`) |
| `MCP_PORT` | Puerto HTTP del MCP (por defecto 3001) |
| `SYNC_PULL=0` | No hacer pull de upstream al sincronizar |

---

## Mecanismo de sincronización

- **Automático**: push a `main` o cada día a las 10:00 (hora de Pekín) obtiene las últimas recetas desde el fork.
- **Manual**: Actions → **Sync & Build** → Run workflow.
- **Cambiar recetas**: envía cambios al fork [CookLikeHOC](https://github.com/AlexanderJ-Carter/CookLikeHOC) / [HowToCook](https://github.com/AlexanderJ-Carter/HowToCook) y espera la próxima sincronización.
- **Cambiar funciones del sitio**: edita directamente el repositorio MyCook.

---

## Solución de problemas

| Síntoma | Solución |
|------|------|
| `Get Pages site failed` | Settings → Pages → Source, elige **GitHub Actions** |
| 404 en la versión con imágenes | Revisa el log de `build-howtocook-images`; o usa `SKIP_IMAGES=1` |
| «Abrir nevera» sin datos | El build necesita sincronizar el CSV en línea; localmente `npm run sync:integrations` |
| Dominio personalizado | CNAME → `alexanderj-carter.github.io` |

---

## Agradecimientos

- [HowToCook](https://github.com/Anduin2017/HowToCook) — Anduin2017 y la comunidad
- [CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC) — Gar-b-age
- [HowToCook con imágenes](https://github.com/king-jingxiang/HowToCook) — king-jingxiang
- [Cook · Manual de uso](https://github.com/YunYouJun/cook) — YunYouJun (MIT, solo integración CSV)

## Contribuidores

Las funciones del sitio de MyCook son mantenidas por los siguientes contribuidores junto con los autores upstream:

- **[AlexanderJ-Carter](https://github.com/AlexanderJ-Carter)** — sitio principal, MCP, CI/CD
- **[WebBrain](https://github.com/webbrain-one)** — traducción del [README al español](./README.es-ES.md)

Este proyecto también cuenta con la asistencia de GitHub Copilot, Codex y Claude en el desarrollo.

La lista completa está en [GitHub Contributors](https://github.com/AlexanderJ-Carter/MyCook/graphs/contributors). ¡Tu contribución es bienvenida! Consulta la [guía de contribución](./CONTRIBUTING.md).

## Licencia

MIT License · el copyright del contenido de las recetas pertenece a sus respectivos autores.

## Más

- [CHANGELOG.md](./CHANGELOG.md) · [GitHub Releases](https://github.com/AlexanderJ-Carter/MyCook/releases)
- [CONTRIBUTING.md](./CONTRIBUTING.md) · [AGENTS.md](./AGENTS.md) (mantenedores)
