import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { AppMetadata } from "@/lib/types";

function resolveUrl(base: string, path: string): string {
  if (!path) return "";
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

function isValidUrl(url: string): boolean {
  try {
    const p = new URL(url);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchSafe(url: string, timeoutMs = 10000): Promise<Response | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
    });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}

async function extractPWA(baseUrl: string): Promise<AppMetadata | null> {
  // Try both /manifest.json and /manifest.webmanifest
  const manifestPaths = ["/manifest.json", "/manifest.webmanifest", "/site.webmanifest"];

  for (const path of manifestPaths) {
    try {
      const manifestUrl = resolveUrl(baseUrl, path);
      const res = await fetchSafe(manifestUrl, 5000);
      if (!res || !res.ok) continue;

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("json") && !contentType.includes("manifest") && !contentType.includes("text")) continue;

      const manifest = await res.json();
      const name: string = manifest.name || manifest.short_name || "";
      if (!name) continue;

      const description: string = manifest.description || "";
      const themeColor: string = manifest.theme_color || "";

      // Resolve best icon — prefer 192+ px
      let icon = "";
      const icons: Array<{ src: string; sizes?: string; purpose?: string }> = manifest.icons ?? [];
      if (icons.length > 0) {
        // Filter out maskable-only icons first
        const anyIcons = icons.filter((i) => !i.purpose || i.purpose.includes("any"));
        const pool = anyIcons.length > 0 ? anyIcons : icons;
        // Pick largest
        const sorted = [...pool].sort((a, b) => {
          const sizeA = parseInt(a.sizes?.split("x")[0] ?? "0");
          const sizeB = parseInt(b.sizes?.split("x")[0] ?? "0");
          return sizeB - sizeA;
        });
        icon = resolveUrl(baseUrl, sorted[0].src);
      }

      return { name, description, icon, type: "pwa", theme_color: themeColor };
    } catch {
      continue;
    }
  }
  return null;
}

async function extractWeb(url: string): Promise<AppMetadata> {
  let name = "";
  let description = "";
  let icon = "";

  const res = await fetchSafe(url);

  if (res && res.ok) {
    try {
      const html = await res.text();
      const $ = cheerio.load(html);

      // Name — multiple fallbacks
      name =
        $('meta[property="og:title"]').attr("content")?.trim() ||
        $('meta[name="twitter:title"]').attr("content")?.trim() ||
        $("title").text().trim() ||
        $("h1").first().text().trim() ||
        "";

      // Description
      description =
        $('meta[property="og:description"]').attr("content")?.trim() ||
        $('meta[name="twitter:description"]').attr("content")?.trim() ||
        $('meta[name="description"]').attr("content")?.trim() ||
        "";

      // Icon — try many sources in priority order
      const candidates: string[] = [];

      // 1. og:image (best quality)
      const ogImage = $('meta[property="og:image"]').attr("content");
      if (ogImage) candidates.push(resolveUrl(url, ogImage));

      // 2. twitter:image
      const twitterImage = $('meta[name="twitter:image"]').attr("content");
      if (twitterImage) candidates.push(resolveUrl(url, twitterImage));

      // 3. apple-touch-icon (high quality, square)
      $('link[rel="apple-touch-icon"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href) candidates.push(resolveUrl(url, href));
      });

      // 4. icon links — prefer larger sizes
      const iconLinks: Array<{ href: string; size: number }> = [];
      $('link[rel="icon"], link[rel="shortcut icon"]').each((_, el) => {
        const href = $(el).attr("href");
        const sizes = $(el).attr("sizes") ?? "0x0";
        const size = parseInt(sizes.split("x")[0]) || 0;
        if (href) iconLinks.push({ href: resolveUrl(url, href), size });
      });
      iconLinks.sort((a, b) => b.size - a.size);
      iconLinks.forEach((l) => candidates.push(l.href));

      // 5. favicon.ico fallback
      candidates.push(resolveUrl(url, "/favicon.ico"));

      // Use first non-empty candidate
      icon = candidates.find((c) => c && c.startsWith("http")) ?? "";

      // Clean up
      name = name.replace(/\s+/g, " ").trim().slice(0, 100);
      description = description.replace(/\s+/g, " ").trim().slice(0, 300);
    } catch {
      // HTML parse failed — use domain as name
    }
  }

  // Fallback name = domain
  if (!name) {
    try {
      name = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      name = "Web App";
    }
  }

  // Fallback icon = Google favicon service (always works)
  if (!icon) {
    try {
      const domain = new URL(url).hostname;
      icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    } catch {
      icon = "";
    }
  }

  return { name, description, icon, type: "web" };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid or missing URL" }, { status: 400 });
  }

  // APK
  if (url.toLowerCase().endsWith(".apk")) {
    const filename = url.split("/").pop()?.replace(/\.apk$/i, "") ?? "Android App";
    // Use Google favicon for the domain as icon
    let icon = "";
    try {
      const domain = new URL(url).hostname;
      icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    } catch { icon = ""; }

    return NextResponse.json({
      name: filename.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      description: "Android application package",
      icon,
      type: "apk",
    } satisfies AppMetadata);
  }

  // Try PWA manifest first
  const pwaData = await extractPWA(url);
  if (pwaData) {
    // If PWA icon is missing, fall back to Google favicon
    if (!pwaData.icon) {
      try {
        const domain = new URL(url).hostname;
        pwaData.icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
      } catch { /* keep empty */ }
    }
    return NextResponse.json(pwaData);
  }

  // Fall back to web extraction
  const webData = await extractWeb(url);
  return NextResponse.json(webData);
}
