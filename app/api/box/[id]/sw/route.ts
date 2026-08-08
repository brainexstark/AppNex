import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Dynamic service worker for each app box.
 * GET /api/box/[id]/sw
 *
 * This SW is registered on the /app/[id] page.
 * Its sole job is to satisfy the browser's PWA installability requirement
 * (a page must have a registered SW to be installable).
 *
 * The SW itself is minimal — it doesn't intercept fetches or cache anything.
 * All it does is exist so the browser allows the install prompt.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Minimal service worker — just needs to exist and activate
  const swCode = `
// AppNex Box Service Worker — v1
// App ID: ${id}
// This worker makes the app box installable as a PWA.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal fetch handler — pass everything through
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
`.trim();

  return new NextResponse(swCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
