const CACHE_NAME = 'sims-v4';
const BRANDING_CACHE_NAME = 'sims-branding-v2';
const IMAGE_CACHE_NAME = 'sims-images-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: clean old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== BRANDING_CACHE_NAME && k !== IMAGE_CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED' }));
  });
});

// Fetch strategy:
// - Navigation requests (HTML): network-first, fallback to cache
// - Branding API (/api/public/tenants/): cache-first with 5min TTL
// - Image requests: cache-first with 7-day TTL
// - Static assets (JS/CSS): network-first, fallback to cache
// - API calls: network-first with cache fallback (5min TTL)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isApiCall = url.pathname.startsWith('/api') || !isSameOrigin;
  const isNavigation = request.mode === 'navigate';
  const isBrandingApi = url.pathname.includes('/api/public/tenants/');
  const isImageRequest = request.destination === 'image' ||
    /\.(png|jpe?g|gif|svg|webp|ico|bmp)$/i.test(url.pathname);

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

  // Branding API: cache-first with 5min TTL — enables offline homepage
  if (isBrandingApi) {
    event.respondWith(
      caches.open(BRANDING_CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) {
            const ts = cached.headers.get('X-Cache-Timestamp');
            if (ts && Date.now() - parseInt(ts) < 300000) {
              // Cache is fresh (5min) — return it
              return cached;
            }
          }
          // Fetch fresh branding data
          return fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              const headers = new Headers(response.headers);
              headers.set('X-Cache-Timestamp', Date.now().toString());
              const cachedResponse = new Response(copy.body, {
                status: response.status,
                statusText: response.statusText,
                headers: headers,
              });
              cache.put(request, cachedResponse);
            }
            return response;
          }).catch(() => cached || new Response('{"error":"Offline"}', {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }));
        })
      )
    );
    return;
  }

  // Images: cache-first with long TTL (7 days)
  if (isImageRequest) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) {
            const ts = cached.headers.get('X-Cache-Timestamp');
            if (ts && Date.now() - parseInt(ts) < 604800000) {
              return cached;
            }
          }
          return fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              const headers = new Headers(response.headers);
              headers.set('X-Cache-Timestamp', Date.now().toString());
              const cachedResponse = new Response(copy.body, {
                status: response.status,
                statusText: response.statusText,
                headers: headers,
              });
              cache.put(request, cachedResponse);
            }
            return response;
          }).catch(() => cached || Response.error());
        })
      )
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

  // Static assets (JS/CSS/etc): network-first, fallback to cache
  // This ensures new code is always loaded when available
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || Response.error()))
  );
});

// Background Sync API: trigger sync when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'simsgh-sync') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'BACKGROUND_SYNC' });
        });
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
    caches.delete(BRANDING_CACHE_NAME);
    caches.delete(IMAGE_CACHE_NAME);
  }
});
