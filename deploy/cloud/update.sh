#!/usr/bin/env bash
# 从 GHCR 拉取最新 full 站 + MCP 并滚动重启；只保留当前使用的镜像层
set -euo pipefail
cd "$(dirname "$0")"
docker compose pull
docker compose up -d --remove-orphans
# 丢掉未使用的旧层 / dangling；不保留历史 tag
docker image prune -af >/dev/null 2>&1 || true
docker builder prune -af >/dev/null 2>&1 || true
echo "[mycook] updated $(date -Iseconds)"
