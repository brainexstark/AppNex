export interface GenerateServiceWorkerOptions {
  id: string;
  scope?: string;
  cacheVersion?: string;
  precacheUrls?: string[];
  targetUrl?: string;
}

export function generateServiceWorker(options: GenerateServiceWorkerOptions): string {
  const {
    id,
    scope,
    cacheVersion = "v1",
    precacheUrls = [],
    targetUrl,
  } = options;

  const cacheName = `box-${id}-${cacheVersion}`;
  const safeScope = scope ?? `/app/${id}`;

  const allPrecache = [safeScope, ...precacheUrls];
  const precacheList = allPrecache
    .map((url) => `    "${url}"`)
    .join(",\n");

  const redirectBlock = targetUrl
    ? `
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.mode !== "navigate") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("${safeScope}")) {
    e.respondWith(Response.redirect("${targetUrl}", 302));
    return;
  }
  caches.match(req).then((cached) => {
    if (cached) return cached;
    return fetch(req).then((res) => {
      const copy = res.clone();
      caches.open("${cacheName}").then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => cached);
  });
});`
    : `
self.addEventListener("fetch", (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (!res || res.status !== 200 || res.type !== "basic") return res;
        const copy = res.clone();
        caches.open("${cacheName}").then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
    })
  );
});`;

  const sw = [
    `// AppNex Box Service Worker — ${id}`,
    `// Scope: ${safeScope}`,
    ``,
    `const CACHE = "${cacheName}";`,
    `const PRECACHE_URLS = [`,
    precacheList,
    `];`,
    ``,
    `self.addEventListener("install", (event) => {`,
    `  event.waitUntil(`,
    `    caches.open(CACHE)`,
    `      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))`,
    `      .then(() => self.skipWaiting())`,
    `  );`,
    `});`,
    ``,
    `self.addEventListener("activate", (event) => {`,
    `  event.waitUntil(`,
    `    caches.keys().then((keys) =>`,
    `      Promise.all(`,
    `        keys`,
    `          .filter((key) => key !== CACHE)`,
    `          .map((key) => caches.delete(key))`,
    `      )`,
    `    ).then(() => self.clients.claim())`,
    `  );`,
    `});`,
    redirectBlock,
    ``,
    `self.addEventListener("message", (event) => {`,
    `  if (event.data && event.data.type === "SKIP_WAITING") {`,
    `    self.skipWaiting();`,
    `  }`,
    `});`,
  ].join("\n");

  return sw;
}

export function generateServiceWorkerResponse(
  options: GenerateServiceWorkerOptions
): Response {
  const body = generateServiceWorker(options);
  const scope = options.scope ?? `/app/${options.id}`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": scope,
    },
  });
}

export function generateInstallerServiceWorker(
  id: string,
  targetUrl: string
): string {
  const scope = `/app/${id}`;
  const cacheName = `box-${id}-installer-v1`;

  return [
    `// AppNex Box Installer SW — ${id}`,
    `// Redirects any navigation under ${scope} to ${targetUrl}`,
    ``,
    `const CACHE = "${cacheName}";`,
    `const TARGET = ${JSON.stringify(targetUrl)};`,
    `const SCOPE = "${scope}";`,
    ``,
    `self.addEventListener("install", (e) => {`,
    `  e.waitUntil(caches.open(CACHE).then((c) => c.add(SCOPE).catch(() => {})));`,
    `  self.skipWaiting();`,
    `});`,
    ``,
    `self.addEventListener("activate", (e) => {`,
    `  e.waitUntil(`,
    `    caches.keys().then((keys) =>`,
    `      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))`,
    `    ).then(() => self.clients.claim())`,
    `  );`,
    `});`,
    ``,
    `self.addEventListener("fetch", (e) => {`,
    `  const req = e.request;`,
    `  if (req.mode === "navigate") {`,
    `    try {`,
    `      const u = new URL(req.url);`,
    `      if (u.pathname.startsWith(SCOPE)) {`,
    `        e.respondWith(Response.redirect(TARGET, 302));`,
    `        return;`,
    `      }`,
    `    } catch {}`,
    `  }`,
    `  e.respondWith(`,
    `    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))`,
    `  );`,
    `});`,
  ].join("\n");
}
