# MyCook - 构建阶段会从 GitHub 克隆 fork 仓库并同步内容，无需本地预置
# 使用：docker build -t mycook:latest .

# ============================
# Build Stage
# ============================
FROM node:22-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

# 依赖
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# 站点源码（不含 cooklikehoc/howtocook，由同步填充）
COPY . .
RUN mkdir -p upstream cooklikehoc howtocook public

# 从 GitHub 克隆 fork 仓库（可改为其它分支：--branch main / master）
ARG COOKLIKEHOC_REPO=https://github.com/AlexanderJ-Carter/CookLikeHOC.git
ARG HOWTOCOOK_REPO=https://github.com/AlexanderJ-Carter/HowToCook.git
ARG COOKLIKEHOC_BRANCH=main
ARG HOWTOCOOK_BRANCH=master

# 克隆时重试 3 次，避免网络/限流导致 exit 128
RUN for i in 1 2 3; do git clone --depth 1 --branch "${COOKLIKEHOC_BRANCH}" "${COOKLIKEHOC_REPO}" upstream/CookLikeHOC && break; rm -rf upstream/CookLikeHOC; [ "$i" = 3 ] && exit 1; sleep 5; done
RUN for i in 1 2 3; do git clone --depth 1 --branch "${HOWTOCOOK_BRANCH}" "${HOWTOCOOK_REPO}" upstream/HowToCook && break; rm -rf upstream/HowToCook; [ "$i" = 3 ] && exit 1; sleep 5; done

# 同步内容并构建
ENV COOKLIKEHOC_PATH=/app/upstream/CookLikeHOC
ENV HOWTOCOOK_PATH=/app/upstream/HowToCook
ENV COOKLIKEHOC_BRANCH=${COOKLIKEHOC_BRANCH}
ENV HOWTOCOOK_BRANCH=${HOWTOCOOK_BRANCH}
ENV VITEPRESS_BASE=/

RUN node scripts/sync-upstream.js && npm run docs:build

# ============================
# Runtime Stage
# ============================
FROM nginx:alpine

LABEL org.opencontainers.image.source="https://github.com/AlexanderJ-Carter/MyCook"
LABEL org.opencontainers.image.description="MyCook - 老乡鸡风格 + 程序员做饭指南，合并整理"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.authors="AlexanderJ-Carter"

COPY --from=builder /app/.vitepress/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
