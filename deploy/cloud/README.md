# Cloud 完整部署（full + MCP）

运行时只是 nginx + Node MCP；**完整**指镜像内含 `/howtocook-images/`，不是另起一套业务。

| 主机 | 后端 | 说明 |
|------|------|------|
| `cook.alexander.xin` | GitHub Pages | 主站 CDN（不在本机） |
| `mycook.alexander.xin` | `127.0.0.1:8090` | `mycook:full`（含图片） |
| `cook-mcp.alexander.xin` | `127.0.0.1:3001` | MCP + Pocket ID / API Key |

## 前置

1. GHCR 已有 `mycook:full` 与 `mycook-mcp`（tag 推送或 Actions 手动 `full`）
2. Pocket ID：API resource = `https://cook-mcp.alexander.xin/mcp`，权限 `mycook:read`
3. Cloudflare：DNS CNAME + Tunnel hostname → `http://127.0.0.1:80`

## 安装

```bash
mkdir -p ~/fleet/mycook && cd ~/fleet/mycook
# 同步本目录文件后：
cp .env.example .env
# 编辑 MCP_API_KEYS（可选）
chmod +x update.sh
./update.sh
```

nginx：把 `nginx/MyCook`、`nginx/CookMCP` 拷到 sites-available 并 enable，reload。

定时同步（每天 4:00）：

```bash
crontab -e
# 0 4 * * * /home/alex/fleet/mycook/update.sh >> /home/alex/fleet/mycook/update.log 2>&1
```

## 鉴权

- JWT：`Authorization: Bearer <Pocket ID access token>`，`aud` = `OIDC_AUDIENCE`
- 或静态 `MCP_API_KEYS`
- `GET /health` 不鉴权；`POST/GET /mcp` 需要 Bearer
