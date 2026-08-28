// One-time recovery worker.
//
// This worker intentionally does not intercept fetch requests. Its only job is
// to remove caches created by older frontend releases, then relinquish control
// after the application unregisters it.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      await self.clients.claim();
    })(),
  );
});
