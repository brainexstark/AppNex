import { NextRequest, NextResponse } from "next/server";

/**
 * Per-app service worker.
 * Scoped to /app/[id] — satisfies browser PWA installability requirement.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scope = `/app/${id}`;

  const sw = [
    `// AppNex Box SW — ${id}`,
    `const CACHE = "box-${id}-v1";`,
    `self.addEventListener("install", (e) => {`,
    `  e.waitUntil(caches.open(CACHE).then((c) => c.add("${scope}").catch(() => {})));`,
    `  self.skipWaiting();`,
    `});`,
    `self.addEventListener("activate", (e) => {`,
    `  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));`,
    `  self.clients.claim();`,
    `});`,
    `self.addEventListener("fetch", () => {});`,
  ].join("\n");

  return new NextResponse(sw, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": scope,
    },
  });
}
