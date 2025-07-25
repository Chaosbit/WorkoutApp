const CACHE_NAME = 'workout-timer-v5';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js', // backward compatibility
  './js/app.js',
  './js/audio-manager.js',
  './js/sw-registration.js',
  './js/timer-manager.js',
  './js/workout-app.js',
  './js/workout-library.js',
  './js/workout-parser.js',
  './manifest.json',
  './sample-workout.md',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});