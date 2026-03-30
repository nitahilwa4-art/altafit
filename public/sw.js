const CACHE_VERSION = 'v1';
const STATIC_CACHE = `altafit-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `altafit-runtime-${CACHE_VERSION}`;

const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/chat',
    '/plans',
    '/profile',
    '/manifest.json',
];

// ── Install: cache app shell ──
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ── Activate: purge old caches ──
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch: network-first for HTML, cache-first for assets ──
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET, cross-origin, and chrome-extension requests
    if (request.method !== 'GET') return;
    if (!url.origin.startsWith(self.location.origin)) return;
    if (url.protocol === 'chrome-extension:') return;

    // Network-first for HTML documents (freshness matters)
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
        );
        return;
    }

    // Cache-first for static assets (CSS, JS, images, fonts)
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});
