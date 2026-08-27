// Cache-first. The dashboard is a snapshot with no live data, so serving a
// cached copy is not a staleness compromise -- it is the correct behaviour.
// A new snapshot ships a new cache name and evicts the old one.
const CACHE = 'kratos-80e28bd1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true})
      .then(hit => hit || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
