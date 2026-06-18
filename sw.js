/* JLPT Study service worker — offline app shell + best-effort streak reminder */
const CACHE = 'jlpt-study-v1';
const ASSETS = ['.', 'index.html', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* cache-first for GET, fall back to cached index.html when offline */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match('index.html'))
    )
  );
});

/* daily reminder when the browser supports Periodic Background Sync (Chrome / installed PWA) */
self.addEventListener('periodicsync', e => {
  if (e.tag === 'streak-reminder') {
    e.waitUntil(self.registration.showNotification('JLPT Study', {
      body: 'Keep your streak alive — time for a quick round!',
      icon: 'icon.svg', badge: 'icon.svg', tag: 'streak'
    }));
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('.'));
});
