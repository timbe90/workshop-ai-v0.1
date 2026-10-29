
const CACHE = 'workshop-ai-bmw-v13-neon-20261029';

const FILES = [
  './',
  './index.html',
  './vehicles.js',
  './technical-data.js',
  './garage.js',
  './documents.js',
  './manifest.webmanifest',
  './neon-theme.css',
  './bimmerlink.png',
  './bimmercode.png',
  './thinkdiag.png'
];

// Neue Version vollständig zwischenspeichern
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Alte Workshop-AI-Caches entfernen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith('workshop-ai-') &&
            key !== CACHE
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Online aktualisieren, offline Cache verwenden
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);

  if (url.origin !== scope.origin) return;
  if (!url.pathname.startsWith(scope.pathname)) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();

          event.waitUntil(
            caches.open(CACHE)
              .then(cache => cache.put(request, copy))
          );
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        return cached || Response.error();
      })
  );
});
