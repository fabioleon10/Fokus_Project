// Service Worker for Fokus App
// Enables offline functionality and improved caching

const CACHE_NAME = 'fokus-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './imagens/logo.png',
    './imagens/foco.png',
    './imagens/descanso-curto.png',
    './imagens/descanso-longo.png',
    './imagens/play_arrow.png',
    './imagens/pause.png',
    './imagens/pattern.png',
    './imagens/favicon.ico',
    './sons/luna-rise-part-one.mp3',
    './sons/play.wav',
    './sons/pause.mp3',
    './sons/beep.mp3'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});