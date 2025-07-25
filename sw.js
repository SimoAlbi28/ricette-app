const CACHE_NAME = 'recipe-app-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/add.html',
  '/style.css',    // cambia con il nome corretto del CSS se diverso
  '/add.css',
  '/script.js',    // cambia con il nome corretto del JS principale
  '/add.js',
  '/img/basic.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap'
];

// Install - caching assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch - cache first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResp => {
        if (cachedResp) return cachedResp;

        return fetch(event.request).then(networkResp => {
          // Optionally cache new requests
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResp.clone());
            return networkResp;
          });
        }).catch(() => {
          // Fallback offline (opzionale)
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
