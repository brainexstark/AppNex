import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { AppMetadata, AppType } from "@/lib/types";

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
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AppNex/1.0; +https://appnex.app)",
        Accept: "text/html,application/json,*/*",
      },
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function extractPWA(baseUrl: string): Promise<AppMetadata | null> {
  try {
    const manifestUrl = resolveUrl(baseUrl, "/manifest.json");
    const res = await fetchWithTimeout(manifestUrl);
    if (!res.ok) return null;

    const manifest = await res.json();
    const name: string = manifest.name || manifest.short_name || "";
    const description: string = manifest.description || "";
    const themeColor: string = manifest.theme_color || "";

    // Resolve icon
    let icon = "";
    const icons: Array<{ src: string; sizes?: string }> = manifest.icons ?? [];
    if (icons.length > 0) {
      // Prefer 192x192 or larger
      const preferred =
        icons.find((i) => i.sizes && parseInt(i.sizes) >= 192) ?? icons[0];
      icon = resolveUrl(baseUrl, preferred.src);
    }

    if (!name) return null;

    return { name, description, icon, type: "pwa", theme_color: themeColor };
  } catch {
    return null;
  }
}

async function extractWeb(url: string): Promise<AppMetadata> {
  let name = "";
  let description = "";
  let icon = "";

  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      // Name: og:title > title > h1
      name =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text().trim() ||
        $("h1").first().text().trim() ||
        "";

      // Description: og:description > meta description
      description =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "";

      // Icon: og:image > apple-touch-icon > icon link > favicon
      const ogImage = $('meta[property="og:image"]').attr("content");
      const appleTouchIcon = $('link[rel="apple-touch-icon"]').attr("href");
      const iconLink =
        $('link[rel="icon"]').attr("href") ||
        $('link[rel="shortcut icon"]').attr("href");

      if (ogImage) {
        icon = resolveUrl(url, ogImage);
      } else if (appleTouchIcon) {
        icon = resolveUrl(url, appleTouchIcon);
      } else if (iconLink) {
        icon = resolveUrl(url, iconLink);
      } else {
        icon = resolveUrl(url, "/favicon.ico");
      }

      // Clean up name
      name = name.replace(/\s+/g, " ").trim().slice(0, 100);
      description = description.replace(/\s+/g, " ").trim().slice(0, 300);
    }
  } catch {
    // Fallback to domain name
  }

  if (!name) {
    try {
      name = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      name = "Web App";
    }
  }

  if (!icon) {
    try {
      icon = resolveUrl(url, "/favicon.ico");
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
    return NextResponse.json(
      { error: "Invalid or missing URL" },
      { status: 400 }
    );
  }

  // APK
  if (url.toLowerCase().endsWith(".apk")) {
    const filename = url.split("/").pop()?.replace(".apk", "") ?? "Android App";
    const data: AppMetadata = {
      name: filename,
      description: "Android application package",
      icon: "",
      type: "apk",
    };
    return NextResponse.json(data);
  }

  // Try PWA first
  const pwaData = await extractPWA(url);
  if (pwaData) {
    return NextResponse.json(pwaData);
  }

  // Fall back to web extraction
  const webData = await extractWeb(url);
  return NextResponse.json(webData);
}
