// Service Worker for MyCook PWA
const CACHE_NAME = 'mycook-cache-v9';
const STATIC_CACHE = 'mycook-static-v9';
const RUNTIME_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 运行时缓存最多留 14 天
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const withBase = (value) => `${BASE_PATH}${value}`;

// 导航响应只有确认是 HTML 时才允许入缓存，
// 避免把 markdown 镜像 / JSON / 错误页缓存到页面 URL 上导致"源码乱码"屏
function isHtmlResponse(response) {
  return response.ok && (response.headers.get('content-type') || '').includes('text/html');
}

function isLiveJson(pathname) {
  return /\/(recent|recipes-index|tips-index|stats|sync-info|pantry)\.json$/.test(pathname);
}

// Precache shell only — recipe JSON must stay network-fresh after sync.
const STATIC_ASSETS = [
  withBase('/'),
  withBase('/manifest.json'),
  withBase('/logo.svg'),
  withBase('/favicon.svg'),
];

// 安装事件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      // 运行时缓存 TTL 清理：上游每日同步，旧图片/带 hash 资源会成为孤儿条目，
      // 不清理迟早撑爆 PWA 存储配额（iOS 约 50MB）触发 eviction 或 install 失败
      .then(() => cleanupRuntimeTtl(CACHE_NAME))
      .then(() => {
        return self.clients.claim();
      })
  );
});

async function cleanupRuntimeTtl(cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const now = Date.now();
    const stale = [];
    for (const request of keys) {
      const cached = await cache.match(request);
      const date = cached && cached.headers.get('date');
      if (date && now - new Date(date).getTime() > RUNTIME_TTL_MS) stale.push(request);
    }
    if (stale.length) await Promise.all(stale.map((request) => cache.delete(request)));
  } catch {
    /* 清理失败不影响激活 */
  }
}

// 请求拦截 - 网络优先，缓存回退策略
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只处理 GET，放行 POST 等非幂等请求
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }

  // 对于导航请求（HTML页面），使用网络优先策略
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isHtmlResponse(response)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 网络失败，从缓存读取
          return caches.match(request).then((response) => {
            return response || caches.match(withBase('/'));
          });
        })
    );
    return;
  }

  // 对于静态资源（CSS、JS、图片），使用缓存优先策略
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // 返回缓存，同时后台更新
            fetch(request).then((response) => {
              if (!response.ok) return;
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            });
            return cachedResponse;
          }

          // 没有缓存，从网络获取
          return fetch(request).then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Recipe JSON: network-first（stale recent.json 曾在 sync 后展示旧 tips/stars），
  // 但断网时退回缓存而不是直接抛错，让 HomePantry/RecentUpdates 拿到降级数据
  if (isLiveJson(url.pathname)) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((cached) => cached || Response.error()))
    );
    return;
  }

  // 对于其他请求，使用网络优先策略
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 网络失败，从缓存读取
        return caches.match(request);
      })
  );
});
