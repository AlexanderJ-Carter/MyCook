# Docker 镜像说明

## 架构

**运行时 = `nginx:alpine`（~25MB）+ VitePress 静态 dist**

构建在 multi-stage 第一层完成（Node 克隆上游 + 构建），最终镜像**不含 Node.js**，只服务静态文件。

## 镜像一览（GHCR）

| 镜像 | 标签 | 体积（约） | 说明 |
|------|------|-----------|------|
| `ghcr.io/alexanderj-carter/mycook` | `latest` `lite` | ~600MB | 默认，双源菜谱 + PWA + Agent JSON |
| 同上 | `v1.6.1` 等 semver | 同上 | push tag 时自动打版本标签 |
| 同上 | `full` / `1.6.1-full` | ~830MB | 含 `/howtocook-images/`（tag 与手动均可构建） |
| `ghcr.io/alexanderj-carter/mycook-mcp` | `latest` | ~200MB+ | MCP Streamable HTTP sidecar（可开 Pocket ID 鉴权） |

## 服务器资源需求（自托管参考）

运行时只是 **nginx 发静态文件**——没有数据库、没有后端计算，内存占用极低。

| 场景 | 内存（运行时） | 磁盘 | 说明 |
|------|---------------|------|------|
| 仅站点（lite 镜像） | **~30MB**（nginx） | ~1GB（含镜像与 Docker 开销） | 最低配 VPS（1核/512MB）都绰绰有余 |
| 站点 + MCP sidecar | ~30MB + **~60MB**（Node） | ~2GB | AI Agent 集成是可选的，不开就不占资源 |
| 在服务器上构建镜像 | 峰值 **~1.5–2GB**（Node/VitePress） | ~3GB（含上游仓库克隆） | 小内存机器建议直接 `docker pull` 预构建镜像，避免本机构建 |

**结论：1核 / 512MB–1GB 内存 / 10GB 磁盘 的入门款服务器即可流畅运行。** 大头的 600MB 镜像体积是菜谱图片，只影响磁盘和首次拉取，不占用内存。

实用建议：

- **拉取优于构建**：`docker pull ghcr.io/alexanderj-carter/mycook:lite` 即可，不必在服务器上跑 Node 构建（那才是吃内存的环节）。
- **不用 Docker 也行**：本质是静态文件，`npm run docs:build:fast` 后把 `.vitepress/dist` 丢给任意 nginx / Caddy / 对象存储 + CDN 都能跑，内存占用同样忽略不计。
- **HTTPS**：容器只暴露 80 端口，前面套一层 Caddy（自动签发证书）或 Nginx Proxy Manager 即可。
- **带宽**：页面本身很小（HTML 几十 KB），流量主要来自菜谱图片按需加载，个人访问量下可忽略。

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

- push tag `v*` → 推送 **lite**（`latest` / semver）+ **full**（`full` / `*-full`）+ **mycook-mcp** + Release
- push `main` → 仅 **Sync & Build**（Pages），不重复打 Docker 包
- 生产机请用 [`deploy/cloud`](./deploy/cloud)：**只 pull，不在 1.6G 机器上 build**

## lite 与 full

两者都是「上游仓库内容 + 本站壳」；差异只有构建参数 `SKIP_IMAGES`：

| | lite | full |
|--|------|------|
| 菜谱 Markdown / 索引 / PWA | 有 | 有 |
| `/howtocook-images/` | 无（可外挂或走 Pages） | 有 |
| 运行时内存 | ~30MB nginx | 同左（多的是磁盘） |
