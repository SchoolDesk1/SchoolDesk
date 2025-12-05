const CACHE_NAME = 'schooldesk-v1';
const urlsToCache = [
    '/',
    '/app',
    '/login',
    '/signup',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    // Network-first for API calls
    if (event.request.url.includes('/auth/') ||
        event.request.url.includes('/school/') ||
        event.request.url.includes('/teacher/') ||
        event.request.url.includes('/parent/') ||
        event.request.url.includes('/super-admin/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Stale-while-revalidate for other requests
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                    return networkResponse;
                });
                return response || fetchPromise;
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
