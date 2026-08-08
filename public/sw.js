// Service Worker for MyCook PWA
const CACHE_NAME = 'mycook-cache-v6';
const STATIC_CACHE = 'mycook-static-v6';
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const withBase = (value) => `${BASE_PATH}${value}`;

// 导航响应只有确认是 HTML 时才允许入缓存，
// 避免把 markdown 镜像 / JSON / 错误页缓存到页面 URL 上导致"源码乱码"屏
function isHtmlResponse(response) {
  return response.ok && (response.headers.get('content-type') || '').includes('text/html');
}

// 需要缓存的静态资源
const STATIC_ASSETS = [
  withBase('/'),
  withBase('/manifest.json'),
  withBase('/logo.svg'),
  withBase('/favicon.svg'),
  withBase('/stats.json'),
  withBase('/recent.json'),
  withBase('/recipes-index.json'),
  withBase('/sync-info.json'),
  withBase('/pantry.json'),
  withBase('/tips-index.json')
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
      .then(() => {
        return self.clients.claim();
      })
  );
});

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
