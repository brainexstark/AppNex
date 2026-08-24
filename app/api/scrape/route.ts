import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { AppMetadata } from "@/lib/types";

const KNOWN_NATIVE_APPS: Record<string, {
  name: string;
  description: string;
  icon: string;
  store_android: string;
  store_ios: string;
  store_windows?: string;
}> = {
  "tiktok.com": {
    name: "TikTok",
    description: "Short-form video platform. Create, share and discover videos.",
    icon: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically",
    store_ios: "https://apps.apple.com/app/tiktok/id835599320",
    store_windows: "https://apps.microsoft.com/detail/9NH2GPH4JZS4",
  },
  "instagram.com": {
    name: "Instagram",
    description: "Photo and video sharing social network by Meta.",
    icon: "https://www.google.com/s2/favicons?domain=instagram.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.instagram.android",
    store_ios: "https://apps.apple.com/app/instagram/id389801252",
  },
  "facebook.com": {
    name: "Facebook",
    description: "Connect with friends and the world around you.",
    icon: "https://www.google.com/s2/favicons?domain=facebook.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.facebook.katana",
    store_ios: "https://apps.apple.com/app/facebook/id284882215",
  },
  "twitter.com": {
    name: "X (Twitter)",
    description: "The everything app — news, entertainment, and conversation.",
    icon: "https://www.google.com/s2/favicons?domain=twitter.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.twitter.android",
    store_ios: "https://apps.apple.com/app/x/id333903271",
  },
  "x.com": {
    name: "X (Twitter)",
    description: "The everything app — news, entertainment, and conversation.",
    icon: "https://www.google.com/s2/favicons?domain=x.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.twitter.android",
    store_ios: "https://apps.apple.com/app/x/id333903271",
  },
  "snapchat.com": {
    name: "Snapchat",
    description: "Camera and messaging app for sharing moments.",
    icon: "https://www.google.com/s2/favicons?domain=snapchat.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.snapchat.android",
    store_ios: "https://apps.apple.com/app/snapchat/id447188370",
  },
  "youtube.com": {
    name: "YouTube",
    description: "Watch, upload and share videos worldwide.",
    icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.google.android.youtube",
    store_ios: "https://apps.apple.com/app/youtube-watch-listen-stream/id544007664",
  },
  "whatsapp.com": {
    name: "WhatsApp",
    description: "Fast, simple, secure messaging and calling.",
    icon: "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.whatsapp",
    store_ios: "https://apps.apple.com/app/whatsapp-messenger/id310633997",
  },
  "telegram.org": {
    name: "Telegram",
    description: "Fast and secure cloud-based messaging app.",
    icon: "https://www.google.com/s2/favicons?domain=telegram.org&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=org.telegram.messenger",
    store_ios: "https://apps.apple.com/app/telegram-messenger/id686449807",
  },
  "spotify.com": {
    name: "Spotify",
    description: "Music and podcast streaming service.",
    icon: "https://www.google.com/s2/favicons?domain=spotify.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.spotify.music",
    store_ios: "https://apps.apple.com/app/spotify-music-and-podcasts/id324684580",
  },
  "netflix.com": {
    name: "Netflix",
    description: "Stream movies, TV shows and more.",
    icon: "https://www.google.com/s2/favicons?domain=netflix.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.netflix.mediaclient",
    store_ios: "https://apps.apple.com/app/netflix/id363590051",
  },
  "uber.com": {
    name: "Uber",
    description: "Request a ride, food delivery, and more.",
    icon: "https://www.google.com/s2/favicons?domain=uber.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.ubercab",
    store_ios: "https://apps.apple.com/app/uber-request-a-ride/id368677368",
  },
  "amazon.com": {
    name: "Amazon",
    description: "Shop millions of products with fast delivery.",
    icon: "https://www.google.com/s2/favicons?domain=amazon.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.amazon.mShop.android.shopping",
    store_ios: "https://apps.apple.com/app/amazon-shopping/id297606951",
  },
  "linkedin.com": {
    name: "LinkedIn",
    description: "Professional networking and job search platform.",
    icon: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.linkedin.android",
    store_ios: "https://apps.apple.com/app/linkedin-network-job-finder/id288429040",
  },
  "pinterest.com": {
    name: "Pinterest",
    description: "Discover and save creative ideas.",
    icon: "https://www.google.com/s2/favicons?domain=pinterest.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.pinterest",
    store_ios: "https://apps.apple.com/app/pinterest/id429047995",
  },
  "reddit.com": {
    name: "Reddit",
    description: "The front page of the internet — communities for everything.",
    icon: "https://www.google.com/s2/favicons?domain=reddit.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.reddit.frontpage",
    store_ios: "https://apps.apple.com/app/reddit/id1064216828",
  },
  "discord.com": {
    name: "Discord",
    description: "Voice, video and text communication for communities.",
    icon: "https://www.google.com/s2/favicons?domain=discord.com&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.discord",
    store_ios: "https://apps.apple.com/app/discord-talk-play-hang-out/id985746746",
    store_windows: "https://apps.microsoft.com/detail/9NZKPSTSNW4E",
  },
  "zoom.us": {
    name: "Zoom",
    description: "Video conferencing and online meetings.",
    icon: "https://www.google.com/s2/favicons?domain=zoom.us&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=us.zoom.videomeetings",
    store_ios: "https://apps.apple.com/app/zoom-one-platform-to-connect/id546505307",
  },
  "threads.net": {
    name: "Threads",
    description: "Text-based conversation app by Instagram.",
    icon: "https://www.google.com/s2/favicons?domain=threads.net&sz=256",
    store_android: "https://play.google.com/store/apps/details?id=com.instagram.barcelona",
    store_ios: "https://apps.apple.com/app/threads-an-instagram-app/id6446901002",
  },
  "play.google.com": {
    name: "Google Play Store",
    description: "Android apps, games, movies and more.",
    icon: "https://www.google.com/s2/favicons?domain=play.google.com&sz=256",
    store_android: "https://play.google.com/store",
    store_ios: "",
  },
  "apps.apple.com": {
    name: "App Store",
    description: "iOS and macOS apps from Apple.",
    icon: "https://www.google.com/s2/favicons?domain=apps.apple.com&sz=256",
    store_android: "",
    store_ios: "https://apps.apple.com",
  },
};

function resolveUrl(base: string, path: string): string {
  if (!path) return "";
  try { return new URL(path, base).href; } catch { return path; }
}

function isValidUrl(url: string): boolean {
  try {
    const p = new URL(url);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch { return false; }
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  return url;
}

async function fetchSafe(url: string, timeoutMs = 10000): Promise<Response | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });
  } catch { return null; }
  finally { clearTimeout(id); }
}

function detectStoreUrl(url: string): AppMetadata | null {
  try {
    const u = new URL(url);

    if (u.hostname === "play.google.com" && u.pathname.includes("/store/apps/details")) {
      const packageId = u.searchParams.get("id") ?? "";
      return {
        name: packageId.split(".").pop() ?? "Android App",
        description: "Android app on Google Play Store",
        icon: `https://www.google.com/s2/favicons?domain=play.google.com&sz=256`,
        type: "store",
        store_android: url,
        store_ios: "",
      };
    }

    if (u.hostname === "apps.apple.com") {
      return {
        name: "iOS App",
        description: "App on the Apple App Store",
        icon: `https://www.google.com/s2/favicons?domain=apps.apple.com&sz=256`,
        type: "store",
        store_android: "",
        store_ios: url,
      };
    }
  } catch { /* ignore */ }
  return null;
}

export interface ScrapeResult {
  title: string;
  iconUrl: string;
  themeColor: string;
  screenshot?: string;
  description: string;
}

async function extractPWA(baseUrl: string): Promise<{ data: AppMetadata; themeColor: string; screenshot?: string } | null> {
  for (const path of ["/manifest.json", "/manifest.webmanifest", "/site.webmanifest"]) {
    try {
      const res = await fetchSafe(resolveUrl(baseUrl, path), 5000);
      if (!res?.ok) continue;
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("json") && !ct.includes("manifest") && !ct.includes("text")) continue;
      const manifest = await res.json();
      const name: string = manifest.name || manifest.short_name || "";
      if (!name) continue;
      const icons: Array<{ src: string; sizes?: string; purpose?: string }> = manifest.icons ?? [];
      let icon = "";
      if (icons.length > 0) {
        const pool = icons.filter((i) => !i.purpose || i.purpose.includes("any"));
        const sorted = [...(pool.length ? pool : icons)].sort((a, b) =>
          parseInt(b.sizes?.split("x")[0] ?? "0") - parseInt(a.sizes?.split("x")[0] ?? "0")
        );
        icon = resolveUrl(baseUrl, sorted[0].src);
      }
      const screenshots: Array<{ src: string }> = manifest.screenshots ?? [];
      const screenshot = screenshots.length > 0 ? resolveUrl(baseUrl, screenshots[0].src) : undefined;
      const themeColor = manifest.theme_color || manifest.background_color || "";
      return {
        data: {
          name,
          description: manifest.description || "",
          icon,
          type: "pwa",
          theme_color: themeColor,
        },
        themeColor,
        screenshot,
      };
    } catch { continue; }
  }
  return null;
}

interface ExtractedWeb {
  metadata: AppMetadata;
  themeColor: string;
  screenshot?: string;
}

async function extractWeb(url: string): Promise<ExtractedWeb> {
  let name = "", description = "", icon = "", themeColor = "", screenshot = "";
  const res = await fetchSafe(url);
  if (res?.ok) {
    try {
      const html = await res.text();
      const $ = cheerio.load(html);

      name = $('meta[property="og:title"]').attr("content")?.trim()
        || $('meta[name="twitter:title"]').attr("content")?.trim()
        || $("title").text().trim() || "";

      description = $('meta[property="og:description"]').attr("content")?.trim()
        || $('meta[name="twitter:description"]').attr("content")?.trim()
        || $('meta[name="description"]').attr("content")?.trim() || "";

      themeColor = $('meta[name="theme-color"]').attr("content")?.trim()
        || $('meta[name="msapplication-TileColor"]').attr("content")?.trim()
        || "";

      const ogImg = $('meta[property="og:image"]').attr("content")
        || $('meta[name="twitter:image"]').attr("content")
        || $('meta[property="og:image:url"]').attr("content");
      if (ogImg) screenshot = resolveUrl(url, ogImg);

      const candidates: string[] = [];
      if (ogImg) candidates.push(resolveUrl(url, ogImg));
      $('link[rel="apple-touch-icon"]').each((_, el) => {
        const h = $(el).attr("href"); if (h) candidates.push(resolveUrl(url, h));
      });
      $('link[rel="apple-touch-icon-precomposed"]').each((_, el) => {
        const h = $(el).attr("href"); if (h) candidates.push(resolveUrl(url, h));
      });
      const iconLinks: { href: string; size: number }[] = [];
      $('link[rel="icon"], link[rel="shortcut icon"], link[rel="alternate icon"]').each((_, el) => {
        const h = $(el).attr("href");
        const s = parseInt($(el).attr("sizes")?.split("x")[0] ?? "0") || 0;
        if (h) iconLinks.push({ href: resolveUrl(url, h), size: s });
      });
      iconLinks.sort((a, b) => b.size - a.size).forEach((l) => candidates.push(l.href));
      candidates.push(resolveUrl(url, "/favicon.ico"));
      icon = candidates.find((c) => c?.startsWith("http")) ?? "";

      name = name.replace(/\s+/g, " ").trim().slice(0, 100);
      description = description.replace(/\s+/g, " ").trim().slice(0, 300);
    } catch { /* ignore */ }
  }

  if (!name) {
    try { name = new URL(url).hostname.replace(/^www\./, ""); } catch { name = "Web App"; }
  }
  if (!icon) {
    try { icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=256`; } catch { icon = ""; }
  }
  if (!themeColor) {
    themeColor = "#3B82F6";
  }

  return {
    metadata: { name, description, icon, type: "web", theme_color: themeColor },
    themeColor,
    screenshot: screenshot || undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl: unknown = body?.url;

    if (typeof rawUrl !== "string" || !rawUrl.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid 'url' field in request body", success: false },
        { status: 400 }
      );
    }

    const url = normalizeUrl(rawUrl);

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL. Must be a valid http or https URL.", success: false },
        { status: 400 }
      );
    }

    try {
      const domain = new URL(url).hostname.replace(/^www\./, "");
      const known = KNOWN_NATIVE_APPS[domain];
      if (known) {
        return NextResponse.json({
          success: true,
          title: known.name,
          description: known.description,
          iconUrl: known.icon,
          themeColor: "#3B82F6",
          type: "store",
          store_android: known.store_android,
          store_ios: known.store_ios,
          store_windows: known.store_windows ?? null,
        } satisfies { success: boolean } & ScrapeResult & { type: string; store_android?: string; store_ios?: string; store_windows?: string | null });
      }
    } catch { /* ignore */ }

    const storeData = detectStoreUrl(url);
    if (storeData) {
      return NextResponse.json({
        success: true,
        title: storeData.name,
        description: storeData.description,
        iconUrl: storeData.icon,
        themeColor: "#3B82F6",
        type: storeData.type,
        store_android: storeData.store_android,
        store_ios: storeData.store_ios,
      });
    }

    if (url.toLowerCase().endsWith(".apk")) {
      let icon = "";
      try { icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=256`; } catch { icon = ""; }
      const filename = url.split("/").pop()?.replace(/\.apk$/i, "") ?? "Android App";
      return NextResponse.json({
        success: true,
        title: filename.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: "Android application package",
        iconUrl: icon,
        themeColor: "#22C55E",
        type: "apk",
      });
    }

    const pwaResult = await extractPWA(url);
    if (pwaResult) {
      if (!pwaResult.data.icon) {
        try { pwaResult.data.icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=256`; } catch { /* ignore */ }
      }
      return NextResponse.json({
        success: true,
        title: pwaResult.data.name,
        description: pwaResult.data.description,
        iconUrl: pwaResult.data.icon,
        themeColor: pwaResult.themeColor || "#3B82F6",
        screenshot: pwaResult.screenshot,
        type: pwaResult.data.type,
      });
    }

    const webResult = await extractWeb(url);
    return NextResponse.json({
      success: true,
      title: webResult.metadata.name,
      description: webResult.metadata.description,
      iconUrl: webResult.metadata.icon,
      themeColor: webResult.themeColor,
      screenshot: webResult.screenshot,
      type: webResult.metadata.type,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: `Scraping failed: ${message}`, success: false },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter", success: false },
      { status: 400 }
    );
  }

  return POST(new NextRequest(req.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: rawUrl }),
  }));
}
