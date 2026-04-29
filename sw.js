const CACHE_NAME = 'cricket-site-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  // Yahan aap apne main assets add kar sakte hain
];

// Service Worker Install karna aur files cache mein dalna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Jab bhi koi file mangi jaye, pehle cache check karo
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
