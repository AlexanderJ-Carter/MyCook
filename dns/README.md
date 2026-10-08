# DNS notes

机器可读记录目前只有 Pages 主站的 DNS-AID（见 `dns-aid.zone`）。

| 主机 | 解析（Cloudflare） | 说明 |
|------|-------------------|------|
| `cook.alexander.xin` | Pages / CDN | 主站；含 `_index._agents` / `_mcp._agents` |
| `mycook.alexander.xin` | Tunnel → cloud `:80` → `8090` | `mycook:full`（含图片版） |
| `cook-mcp.alexander.xin` | Tunnel → cloud `:80` → `3001` | MCP + `POST /ask` |

CNAME / Tunnel hostname 在 Cloudflare 面板维护，不入库密钥。
