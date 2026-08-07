# MyCook - 运行时镜像 = nginx:alpine (~25MB) + 静态站点
# 轻量版（默认 SKIP_IMAGES=1）不含图片版，适合大多数部署场景
#
# 构建:
#   docker build -t mycook:lite .                          # 轻量（推荐）
#   docker build --build-arg SKIP_IMAGES=0 -t mycook:full . # 完整（含图片版）
#
# 一键: ./scripts/install.sh  或  npm run mycook -- docker:lite

# ============================
# Build Stage
# ============================
FROM node:22-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY . .
RUN mkdir -p upstream cooklikehoc howtocook public

ARG COOKLIKEHOC_REPO=https://github.com/AlexanderJ-Carter/CookLikeHOC.git
ARG HOWTOCOOK_REPO=https://github.com/AlexanderJ-Carter/HowToCook.git
ARG COOKLIKEHOC_BRANCH=main
ARG HOWTOCOOK_BRANCH=master
ARG SKIP_IMAGES=1
ARG HOWTOCOOK_IMAGES_REPO=https://github.com/king-jingxiang/HowToCook.git

RUN clone_with_retry() { \
      local repo=$1; local dest=$2; local branch=$3; \
      for i in 1 2 3 4 5; do \
        if git clone --depth 1 --branch "$branch" "$repo" "$dest" 2>/dev/null; then return 0; fi; \
        rm -rf "$dest"; sleep 10; \
      done; return 1; \
    } \
    && clone_with_retry "${COOKLIKEHOC_REPO}" /app/upstream/CookLikeHOC "${COOKLIKEHOC_BRANCH}" \
    && clone_with_retry "${HOWTOCOOK_REPO}" /app/upstream/HowToCook "${HOWTOCOOK_BRANCH}"

RUN if [ "$SKIP_IMAGES" = "1" ]; then \
      echo "SKIP_IMAGES=1 — skip HowToCookImages clone"; \
    else \
      clone_with_retry() { \
        local repo=$1; local dest=$2; local branch=$3; \
        for i in 1 2 3 4 5; do \
          if git clone --depth 1 --branch "$branch" "$repo" "$dest" 2>/dev/null; then return 0; fi; \
          rm -rf "$dest"; sleep 10; \
        done; return 0; \
      } && clone_with_retry "${HOWTOCOOK_IMAGES_REPO}" /app/upstream/HowToCookImages master || true; \
    fi

ENV COOKLIKEHOC_PATH=/app/upstream/CookLikeHOC
ENV HOWTOCOOK_PATH=/app/upstream/HowToCook
ENV HOWTOCOOK_IMAGES_PATH=/app/upstream/HowToCookImages
ENV SYNC_PULL=0
ENV SKIP_IMAGES=${SKIP_IMAGES}
ENV VITEPRESS_BASE=/

RUN node scripts/sync-upstream.js \
    && if [ "$SKIP_IMAGES" = "1" ]; then npm run docs:build:fast; else npm run docs:build; fi \
    && node scripts/write-image-manifest.js /app/.vitepress/dist

# ============================
# Runtime Stage — 仅 nginx + 静态文件
# ============================
FROM nginx:1.27-alpine

ARG SKIP_IMAGES=1

LABEL org.opencontainers.image.source="https://github.com/AlexanderJ-Carter/MyCook"
LABEL org.opencontainers.image.description="MyCook static recipe site (nginx + dist)"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.authors="AlexanderJ-Carter"
LABEL io.mycook.skip-images="${SKIP_IMAGES}"

COPY --from=builder /app/.vitepress/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

EXPOSE 80
