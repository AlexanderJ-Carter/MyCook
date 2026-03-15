# ============================
# Build Stage
# ============================
FROM node:22-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# 复制源代码
COPY . .

# 创建上游目录（CI 会挂载内容，本地构建需要手动同步）
RUN mkdir -p upstream/CookLikeHOC upstream/HowToCook

# 如果有环境变量指定上游路径，则同步
# CI 构建时会通过 build-args 或挂载提供内容
ARG COOKLIKEHOC_PATH=""
ARG HOWTOCOOK_PATH=""

# 同步内容（如果环境变量存在）
RUN if [ -n "$COOKLIKEHOC_PATH" ] && [ -d "$COOKLIKEHOC_PATH" ]; then \
        cp -r "$COOKLIKEHOC_PATH"/* upstream/CookLikeHOC/ 2>/dev/null || true; \
    fi
RUN if [ -n "$HOWTOCOOK_PATH" ] && [ -d "$HOWTOCOOK_PATH" ]; then \
        cp -r "$HOWTOCOOK_PATH"/* upstream/HowToCook/ 2>/dev/null || true; \
    fi

# 运行同步脚本（如果上游内容存在）
RUN if [ "$(ls -A upstream/CookLikeHOC 2>/dev/null)" ] && [ "$(ls -A upstream/HowToCook 2>/dev/null)" ]; then \
        COOKLIKEHOC_PATH=/app/upstream/CookLikeHOC HOWTOCOOK_PATH=/app/upstream/HowToCook node scripts/sync-upstream.js; \
    fi

# 构建站点
RUN npm run docs:build

# ============================
# Runtime Stage
# ============================
FROM nginx:alpine

# 添加标签
LABEL org.opencontainers.image.source="https://github.com/AlexanderJ-Carter/MyCook"
LABEL org.opencontainers.image.description="MyCook 菜谱网站"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.authors="AlexanderJ-Carter"

# 复制构建产物
COPY --from=builder /app/.vitepress/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
