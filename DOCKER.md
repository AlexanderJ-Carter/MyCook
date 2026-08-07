# Docker 镜像说明

## 架构

**运行时 = `nginx:alpine`（~25MB）+ VitePress 静态 dist**

构建在 multi-stage 第一层完成（Node 克隆上游 + 构建），最终镜像**不含 Node.js**，只服务静态文件。

## 镜像一览（GHCR）

| 镜像 | 标签 | 体积（约） | 说明 |
|------|------|-----------|------|
| `ghcr.io/alexanderj-carter/mycook` | `latest` `lite` | ~600MB | 默认，双源菜谱 + PWA + Agent JSON |
| 同上 | `v1.5.0` 等 semver | 同上 | push tag 时自动打版本标签 |
| 同上 | `full` | ~830MB | 含 `/howtocook-images/`（Actions 手动构建） |
| `ghcr.io/alexanderj-carter/mycook-mcp` | `latest` | ~200MB+ | MCP Streamable HTTP sidecar |

## 一键启动

```bash
./scripts/install.sh              # 拉取 lite 并启动
./scripts/install.sh docker-full  # 本地构建 full

# Windows
.\scripts\install.ps1

# CLI
npm run mycook -- docker:pull
npm run mycook -- docker:lite
npm run mycook -- docker:stop
```

访问 http://localhost:8080 · 镜像清单 http://localhost:8080/image-manifest.json

## Compose Profiles

```bash
docker compose up -d --build              # lite 站点
docker compose --profile full up -d --build # full 站点
docker compose --profile dev up             # Node 开发服 :5173
docker compose --profile agent up -d --build # lite + MCP :3001
```

## 构建参数

| ARG | 默认 | 说明 |
|-----|------|------|
| `SKIP_IMAGES` | `1` | `1`=lite，`0`=full |
| `COOKLIKEHOC_REPO` | fork 地址 | 可换自有源 |
| `HOWTOCOOK_REPO` | fork 地址 | 可换自有源 |

```bash
docker build --build-arg SKIP_IMAGES=1 -t mycook:lite .
docker build --build-arg SKIP_IMAGES=0 -t mycook:full .
docker build -f Dockerfile.mcp -t mycook-mcp .
```

## Agent 能力

Docker 部署比 GitHub Pages 多：

- `Accept: text/markdown` 内容协商（菜谱 Markdown 镜像）
- `Link` 响应头（API 目录发现）
- 可选 **MCP sidecar**（`mycook-mcp` 镜像或 `npm run mcp:http`）

详见 [MCP.md](./MCP.md)

## CI 构建

- push `main` → 自动推送 `mycook:latest` + `mycook-mcp:latest`
- push tag `v*` → 额外打 semver 标签 + GitHub Release
- Actions → **Docker Build & Push** → 手动选 `full` 或 MCP
