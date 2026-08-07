#!/usr/bin/env sh
# MyCook 一键安装 / 部署（Linux / macOS / Git Bash）
set -e

REPO="${Mycook_REPO:-AlexanderJ-Carter/MyCook}"
PORT="${Mycook_PORT:-8080}"
MODE="${1:-}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  → %s\n' "$*"; }

show_help() {
    bold "MyCook 一键部署"
    echo ""
    echo "用法: ./scripts/install.sh [模式]"
    echo ""
    echo "模式:"
    echo "  docker-lite    拉取 GHCR 轻量镜像并启动（推荐，默认）"
    echo "  docker-full    本地构建完整镜像（含图片版，耗时长、体积大）"
    echo "  docker-build   本地构建轻量镜像并启动"
    echo "  npm-dev        Node 本地开发（需先 sync 上游）"
    echo "  help           显示帮助"
    echo ""
    echo "环境变量: Mycook_PORT=8080  Mycook_REPO=..."
    echo "启动后访问: http://localhost:${PORT}"
}

need_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "缺少命令: $1" >&2
        exit 1
    fi
}

docker_lite_pull() {
    need_cmd docker
    bold "拉取轻量镜像并启动 MyCook..."
    info "ghcr.io/alexanderj-carter/mycook:latest (lite，不含图片版)"
    docker pull "ghcr.io/alexanderj-carter/mycook:latest"
    docker rm -f mycook 2>/dev/null || true
    docker run -d --name mycook -p "${PORT}:80" --restart unless-stopped \
        "ghcr.io/alexanderj-carter/mycook:latest"
    bold "✓ 已启动 → http://localhost:${PORT}"
    info "查看内容清单: curl -s http://localhost:${PORT}/image-manifest.json | head"
    info "停止: docker rm -f mycook"
}

docker_build_lite() {
    need_cmd docker
    bold "本地构建轻量镜像..."
    docker build --build-arg SKIP_IMAGES=1 -t mycook:lite .
    docker rm -f mycook 2>/dev/null || true
    docker run -d --name mycook -p "${PORT}:80" --restart unless-stopped mycook:lite
    bold "✓ 已启动 → http://localhost:${PORT}"
}

docker_build_full() {
    need_cmd docker
    bold "本地构建完整镜像（含图片版，可能需要 15–30 分钟）..."
    docker build --build-arg SKIP_IMAGES=0 -t mycook:full .
    docker rm -f mycook 2>/dev/null || true
    docker run -d --name mycook -p "${PORT}:80" --restart unless-stopped mycook:full
    bold "✓ 已启动 → http://localhost:${PORT}"
}

npm_dev() {
    need_cmd node
    need_cmd npm
    bold "Node 本地开发模式"
    npm install
    if [ ! -d cooklikehoc ] || [ ! -d howtocook ]; then
        info "未检测到内容目录，尝试 sync（需上级目录有 CookLikeHOC / HowToCook）..."
        npm run sync || true
    fi
    info "启动开发服务器..."
    npm run docs:dev
}

case "${MODE:-docker-lite}" in
    docker-lite|lite|"") docker_lite_pull ;;
    docker-full|full)    docker_build_full ;;
    docker-build|build)  docker_build_lite ;;
    npm-dev|dev)         npm_dev ;;
    help|-h|--help)      show_help ;;
    *)
        echo "未知模式: $MODE" >&2
        show_help
        exit 1
        ;;
esac
