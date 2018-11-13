var shellCacheName = "pwa-todo-v1";
var filesToCache = [
    "./",
    "./index.html",
    "https://cdn.jsdelivr.net/npm/animate.css@3.5.1",
    "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
    "https://fonts.googleapis.com/css?family=Montserrat:400,700",
    "https://cdn.jsdelivr.net/npm/vue",
    "https://shaif.nl/Flight/js/chunk-vendors.d6a7661f.js",
    "https://shaif.nl/Flight/css/chunk-vendors.1f5918fd.css",
    "https://shaif.nl/Flight/js/app.ecd2236f.js",
    "https://shaif.nl/Flight/css/app.878f863c.css",
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
