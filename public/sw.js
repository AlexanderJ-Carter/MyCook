// Service Worker for MyCook PWA
const CACHE_NAME = 'mycook-cache-v1';
const STATIC_CACHE = 'mycook-static-v1';
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const withBase = (value) => `${BASE_PATH}${value}`;

// 需要缓存的静态资源
const STATIC_ASSETS = [
  withBase('/'),
  withBase('/manifest.json'),
  withBase('/logo.svg'),
  withBase('/favicon.svg')
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
          // 缓存响应
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
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

  // 对于其他请求，使用缓存优先策略
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 返回缓存，同时后台更新
          fetch(request).then((response) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          });
          return cachedResponse;
        }

        // 没有缓存，从网络获取
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
  );
});
