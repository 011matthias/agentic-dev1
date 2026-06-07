// CREW service worker. Goal: the game opens and plays with no network after the
// first visit (it is fully client-side; the only runtime dependency is its own
// static assets). Strategy is deliberately filename-agnostic so it survives
// Vite's content-hashed bundle names without a generated precache manifest.
//
// - Navigations: network-first, fall back to the cached app shell when offline.
// - Same-origin GETs: stale-while-revalidate (instant from cache, refresh behind).
const CACHE = 'crew-v2';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  // Self-hosted fonts: precache so the offline PWA never falls back to system
  // fonts on a cold (network-less) first paint.
  '/fonts/luckiest-guy.woff2',
  '/fonts/fredoka-500.woff2',
  '/fonts/fredoka-600.woff2',
  '/fonts/fredoka-700.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
