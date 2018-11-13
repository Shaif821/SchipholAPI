var shellCacheName = "pwa-todo-v1";
var filesToCache = [
    "./",
    "./index.html",
    "https://cdn.jsdelivr.net/npm/animate.css@3.5.1",
    "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
    "https://fonts.googleapis.com/css?family=Montserrat:400,700",
    "https://cdn.jsdelivr.net/npm/vue",
    "www.shaif.netlify.com/js/chunk-vendors.67889104.js",
    "www.shaif.netlify.com/css/chunk-vendors.1f5918fd.css",
    "www.shaif.netlify.com/js/app.d80e0ee9.js",
    "www.shaif.netlify.com/css/app.878f863c.css",
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
