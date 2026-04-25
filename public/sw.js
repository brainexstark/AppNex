// AppNex Service Worker v2
// A valid, active service worker is REQUIRED for the browser to show
// the PWA install prompt (beforeinstallprompt event).

const CACHE_NAME = "appnex-v2";

const PRECACHE = [
  "/",
  "/apps",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icon.svg",
];

// ── Install: cache core assets ────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
    )
  );
  // Take control immediately — don't wait for old SW to die
  self.skipWaiting();
});

// ── Activate: clean up old caches ────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  // Claim all open clients immediately
  self.clients.claim();
});

// ── Fetch: stale-while-revalidate for pages, cache-first for assets ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Skip Next.js internals and API routes — always go to network
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/")
  ) return;

  // For HTML navigation — network first, fall back to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // For everything else — cache first, then network
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
    )
  );
});
