# MyCook - 构建阶段会从 GitHub 克隆 fork 仓库并同步内容，无需本地预置
# 使用：docker build -t mycook:latest .
# 多架构构建已禁用（arm64 在 QEMU 下 Node.js 会触发 Illegal instruction）

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

# 克隆核心仓库（必须成功）
RUN clone_with_retry() { \
      local repo=$1; \
      local dest=$2; \
      local branch=$3; \
      for i in 1 2 3 4 5; do \
        if git clone --depth 1 --branch "$branch" "$repo" "$dest" 2>/dev/null; then \
          echo "Successfully cloned $repo"; \
          return 0; \
        fi; \
        echo "Attempt $i failed, retrying in 10s..."; \
        rm -rf "$dest"; \
        sleep 10; \
      done; \
      echo "Failed to clone $repo after 5 attempts"; \
      return 1; \
    } \
    && clone_with_retry "${COOKLIKEHOC_REPO}" /app/upstream/CookLikeHOC "${COOKLIKEHOC_BRANCH}" \
    && clone_with_retry "${HOWTOCOOK_REPO}" /app/upstream/HowToCook "${HOWTOCOOK_BRANCH}"

# 可选：克隆图片版仓库，失败不影响构建
RUN clone_with_retry_optional() { \
      local repo=$1; \
      local dest=$2; \
      local branch=$3; \
      for i in 1 2 3 4 5; do \
        if git clone --depth 1 --branch "$branch" "$repo" "$dest" 2>/dev/null; then \
          echo "Successfully cloned $repo"; \
          return 0; \
        fi; \
        echo "Warning: Attempt $i failed for $repo, retrying in 10s..."; \
        rm -rf "$dest"; \
        sleep 10; \
      done; \
      echo "Warning: Failed to clone optional $repo after 5 attempts - continuing without it"; \
      return 0; \
    } \
    && clone_with_retry_optional "https://github.com/king-jingxiang/HowToCook.git" /app/upstream/HowToCookImages master || true

# 同步内容并构建（图片版构建失败不会导致整体失败，因为 docs:build 已有 || true）
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

# 复制构建产物
COPY --from=builder /app/.vitepress/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
