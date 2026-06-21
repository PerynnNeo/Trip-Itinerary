/* Seoul itinerary service worker — offline-first for a travel companion.
   Bump VERSION to invalidate old caches on deploy. */
const VERSION = 'seoul-v1';
const SHELL = 'shell-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;

// Cached on install so a cold offline launch still boots the app.
const PRECACHE = ['/', '/print', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await Promise.all(
        PRECACHE.map((u) => cache.add(u).catch(() => {})),
      );
      self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // never intercept writes (PUT/DELETE)

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // App navigations: network-first, fall back to the cached shell so any route
  // (including deep links) opens offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const shell = await caches.open(SHELL);
          return (await shell.match(req)) || (await shell.match('/')) || Response.error();
        }
      })(),
    );
    return;
  }

  if (!sameOrigin) return; // let cross-origin (e.g. blob redirects) pass through

  // Hashed build assets, fonts, icons: stale-while-revalidate.
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/icon')) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Trip content + weather: SWR (static-ish, safe to serve stale offline).
  if (url.pathname === '/api/itinerary' || url.pathname === '/api/weather') {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Shared state + photo index: network-first, last-known on failure.
  if (url.pathname === '/api/state' || url.pathname === '/api/photos') {
    event.respondWith(networkFirst(req));
    return;
  }

  // Individual photos: cache-first so already-seen photos work offline.
  if (url.pathname.startsWith('/api/photos/')) {
    event.respondWith(cacheFirst(req));
    return;
  }
});

function cacheable(res) {
  return res && (res.status === 200 || res.type === 'opaque');
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (cacheable(res)) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

async function networkFirst(req) {
  const cache = await caches.open(RUNTIME);
  try {
    const res = await fetch(req);
    if (cacheable(res)) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req)) || Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (cacheable(res)) cache.put(req, res.clone());
    return res;
  } catch {
    return cached || Response.error();
  }
}
