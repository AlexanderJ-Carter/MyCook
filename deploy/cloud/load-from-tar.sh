#!/usr/bin/env bash
# 本机用 crane 拉镜像后 scp 到此目录，再执行本脚本（避免服务器直连 GHCR）
#   crane pull --platform linux/amd64 ghcr.io/alexanderj-carter/mycook:full mycook-full.tar
#   crane pull --platform linux/amd64 ghcr.io/alexanderj-carter/mycook-mcp:latest mycook-mcp-latest.tar
#   scp *.tar cloud:~/fleet/mycook/
set -euo pipefail
cd "$(dirname "$0")"
[[ -f mycook-full.tar ]] && docker load -i mycook-full.tar
[[ -f mycook-mcp-latest.tar ]] && docker load -i mycook-mcp-latest.tar
docker compose up -d --remove-orphans
rm -f mycook-full.tar mycook-mcp-latest.tar
echo "[mycook] loaded from tar $(date -Iseconds)"
