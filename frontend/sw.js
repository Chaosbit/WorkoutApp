const CACHE_NAME = 'workout-timer-v6';
const urlsToCache = [
  './',
  './index.html',
  './workout-management.html',
  './training.html', 
  './training-plan.html',
  './material-design-enhanced.css',
  './script.js', // backward compatibility
  './js/app.js',
  './js/audio-manager.js',
  './js/constants.js',
  './js/home-page.js',
  './js/workout-management-page.js',
  './js/training-page.js',
  './js/training-plan-page.js',
  './js/navigation-manager.js',
  './js/screen-wake-manager.js',
  './js/statistics-manager.js',
  './js/statistics-page.js',
  './js/sw-registration.js',
  './js/sync-manager.js',
  './js/timer-manager.js',
  './js/training-plan-manager.js',
  './js/ui-utils.js',
  './js/workout-app.js',
  './js/workout-library.js',
  './js/workout-parser.js',
  './js/workout-context-component.js',
  './js/components/workout-manager.js',
  './js/components/timer-display.js',
  './js/components/workout-controls.js',
  './js/components/exercise-list.js',
  './statistics.html',
  './manifest.json',
  './sample-workout.md',
  './icon-192.png',
  './icon-512.png',
  './icon.svg'
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