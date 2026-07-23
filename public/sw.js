const CACHE_NAME = 'sims-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/index.web.js',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Navigation requests (HTML): network-first, fallback to cache
// - Static assets: cache-first
// - API calls: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isApiCall = url.pathname.startsWith('/api') || !isSameOrigin;
  const isNavigation = request.mode === 'navigate';

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  if (isApiCall) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              const headers = new Headers();
              headers.set('X-Cache-Timestamp', Date.now().toString());
              const cachedResponse = new Response(copy.body, {
                status: copy.status,
                statusText: copy.statusText,
                headers: headers,
              });
              cache.put(request, cachedResponse);
            });
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => {
          if (!cached) return new Response('{"error":"Offline"}', {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
          const ts = cached.headers.get('X-Cache-Timestamp');
          if (ts && Date.now() - parseInt(ts) > 300000) {
            return new Response('{"error":"Offline - cached data expired"}', {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          return cached;
        }))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') caches.delete(CACHE_NAME);
});
