var shellCacheName = "pwa-todo-v1";
var filesToCache = [
    "./",
    "./index.html",
    "https://cdn.jsdelivr.net/npm/animate.css@3.5.1",
    "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
    "https://fonts.googleapis.com/css?family=Montserrat:400,700",
    "https://cdn.jsdelivr.net/npm/vue",
    "https://shaif.nl/Flight/js/",
    "https://shaif.nl/Flight/css/",
];

// Listen to installation event
self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(shellCacheName).then(function(cache) {

            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});
