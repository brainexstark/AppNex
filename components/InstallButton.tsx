"use client";

/**
 * InstallButton — used on app grid cards.
 *
 * BEHAVIOUR BY TYPE:
 *
 * store / known-native  → window.location.href to correct app store (Play/App Store)
 * apk                   → direct file download, no page open
 * pwa / web             → navigate to /app/[id] which has BoxInstallButton
 *                         (that page registers a per-app SW + triggers native install prompt)
 */

import { Download, Smartphone, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { App } from "@/lib/types";

interface InstallButtonProps {
  app: App;
  size?: "sm" | "md" | "lg";
  className?: string;
}

type AppExt = App & {
  store_android?: string | null;
  store_ios?: string | null;
  store_windows?: string | null;
};

const NATIVE_STORES: Record<string, { android?: string; ios?: string }> = {
  "tiktok.com":    { android: "https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically", ios: "https://apps.apple.com/app/tiktok/id835599320" },
  "instagram.com": { android: "https://play.google.com/store/apps/details?id=com.instagram.android",   ios: "https://apps.apple.com/app/instagram/id389801252" },
  "facebook.com":  { android: "https://play.google.com/store/apps/details?id=com.facebook.katana",     ios: "https://apps.apple.com/app/facebook/id284882215" },
  "twitter.com":   { android: "https://play.google.com/store/apps/details?id=com.twitter.android",     ios: "https://apps.apple.com/app/x/id333903271" },
  "x.com":         { android: "https://play.google.com/store/apps/details?id=com.twitter.android",     ios: "https://apps.apple.com/app/x/id333903271" },
  "snapchat.com":  { android: "https://play.google.com/store/apps/details?id=com.snapchat.android",    ios: "https://apps.apple.com/app/snapchat/id447188370" },
  "youtube.com":   { android: "https://play.google.com/store/apps/details?id=com.google.android.youtube", ios: "https://apps.apple.com/app/youtube/id544007664" },
  "whatsapp.com":  { android: "https://play.google.com/store/apps/details?id=com.whatsapp",            ios: "https://apps.apple.com/app/whatsapp/id310633997" },
  "telegram.org":  { android: "https://play.google.com/store/apps/details?id=org.telegram.messenger",  ios: "https://apps.apple.com/app/telegram/id686449807" },
  "spotify.com":   { android: "https://play.google.com/store/apps/details?id=com.spotify.music",       ios: "https://apps.apple.com/app/spotify/id324684580" },
  "netflix.com":   { android: "https://play.google.com/store/apps/details?id=com.netflix.mediaclient", ios: "https://apps.apple.com/app/netflix/id363590051" },
  "discord.com":   { android: "https://play.google.com/store/apps/details?id=com.discord",             ios: "https://apps.apple.com/app/discord/id985746746" },
  "reddit.com":    { android: "https://play.google.com/store/apps/details?id=com.reddit.frontpage",    ios: "https://apps.apple.com/app/reddit/id1064216828" },
  "linkedin.com":  { android: "https://play.google.com/store/apps/details?id=com.linkedin.android",    ios: "https://apps.apple.com/app/linkedin/id288429040" },
  "uber.com":      { android: "https://play.google.com/store/apps/details?id=com.ubercab",             ios: "https://apps.apple.com/app/uber/id368677368" },
  "threads.net":   { android: "https://play.google.com/store/apps/details?id=com.instagram.barcelona", ios: "https://apps.apple.com/app/threads/id6446901002" },
  "amazon.com":    { android: "https://play.google.com/store/apps/details?id=com.amazon.mShop.android.shopping", ios: "https://apps.apple.com/app/amazon/id297606951" },
  "zoom.us":       { android: "https://play.google.com/store/apps/details?id=us.zoom.videomeetings",   ios: "https://apps.apple.com/app/zoom/id546505307" },
  "pinterest.com": { android: "https://play.google.com/store/apps/details?id=com.pinterest",           ios: "https://apps.apple.com/app/pinterest/id429047995" },
};

function detectPlatform(): { isIOS: boolean; isAndroid: boolean; isWindows: boolean } {
  if (typeof navigator === "undefined") return { isIOS: false, isAndroid: false, isWindows: false };
  const ua = navigator.userAgent || "";
  const platform = (navigator as { platform?: string }).platform || "";
  // iPadOS 13+ reports as Macintosh, so check for touch + iPad dimensions too
  const isIOS =
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && typeof navigator !== "undefined" && "maxTouchPoints" in navigator && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isWindows = /Windows/.test(ua) || /Win/.test(platform);
  return { isIOS, isAndroid, isWindows };
}

function getStoreUrl(app: AppExt): string | null {
  const { isIOS, isAndroid, isWindows } = detectPlatform();

  // DB store fields first, respecting the user's platform
  if (isIOS && app.store_ios) return app.store_ios;
  if (isAndroid && app.store_android) return app.store_android;
  if (isWindows && app.store_windows) return app.store_windows;
  // Fallback: any non-null store field
  if (app.store_android || app.store_ios || app.store_windows) {
    return (app.store_android || app.store_ios || app.store_windows) as string;
  }

  // Built-in map
  try {
    const domain = new URL(app.url).hostname.replace(/^www\./, "");
    const entry = NATIVE_STORES[domain];
    if (entry) {
      const platformMatch = isIOS ? entry.ios : entry.android;
      return platformMatch || entry.android || entry.ios || null;
    }
  } catch { /* ignore */ }
  return null;
}

export default function InstallButton({ app, size = "md", className = "" }: InstallButtonProps) {
  const router = useRouter();
  const ext = app as AppExt;

  const storeUrl = getStoreUrl(ext);
  const isStore  = app.type === "store" || !!storeUrl;
  const isApk    = !isStore && (app.type === "apk" || (app.url && app.url.toLowerCase().endsWith(".apk")));

  const handleClick = useCallback(() => {
    // ── Store / native: open correct store ─────────────────
    if (isStore) {
      try {
        const target = storeUrl || app.url;
        window.open(target, "_blank", "noopener,noreferrer");
        return;
      } catch {
        // Fallback: same-tab navigation if window.open blocked
        try { window.location.assign(storeUrl || app.url); } catch { /* ignore */ }
        return;
      }
    }

    // ── APK: trigger direct download ────────────────────────
    if (isApk) {
      try {
        const a = document.createElement("a");
        a.href = app.url;
        a.download = (app.name || "app").replace(/\s+/g, "-") + ".apk";
        a.rel = "noopener";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        // Delay removal to ensure the click fires on slower browsers
        setTimeout(() => { try { document.body.removeChild(a); } catch { /* ignore */ } }, 0);
        return;
      } catch {
        // Fallback: open in new tab
        try { window.open(app.url, "_blank", "noopener,noreferrer"); } catch { /* ignore */ }
        return;
      }
    }

    // ── PWA / Web: navigate to the box install page ─────────
    try {
      router.push(`/app/${app.id}`);
    } catch {
      try { window.location.assign(`/app/${app.id}`); } catch { /* ignore */ }
    }
  }, [isStore, isApk, storeUrl, app.url, app.name, app.id, router]);

  const sizeClasses = {
    sm: "px-3 py-2 text-xs gap-1.5 sm:py-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };
  const iconSize = { sm: 13, md: 15, lg: 17 }[size];

  const label = isApk ? "Download" : isStore ? "Get App" : "Install";
  const Icon  = isApk ? Download   : isStore ? Smartphone : Layers;
  const titleText = isStore
    ? "Opens the correct app store for your device"
    : isApk
    ? "Downloads the APK file directly"
    : "Opens the install page for this app box";

  return (
    <button
      onClick={handleClick}
      aria-label={`${label} ${app.name}`}
      title={titleText}
      type="button"
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 select-none
        ${sizeClasses[size]}
        bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg
        md:hover:shadow-blue-500/30 md:hover:scale-105 active:scale-[0.97]
        transform-gpu will-change-transform
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
        ${className}
      `}
      style={{ contain: "layout paint style" }}
    >
      <Icon size={iconSize} aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
