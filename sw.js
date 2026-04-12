const CACHE = 'tnv-fact-arena-v1';
const ASSETS = [
  '/tnv-fact-arena/',
  '/tnv-fact-arena/index.html',
  '/tnv-fact-arena/manifest.json',
  '/tnv-fact-arena/icon-192.png',
  '/tnv-fact-arena/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Firebase requests — always network first
  if(e.request.url.includes('firebaseio.com')){
    e.respondWith(fetch(e.request).catch(() => new Response('offline', {status: 503})));
    return;
  }
  // App shell — cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
