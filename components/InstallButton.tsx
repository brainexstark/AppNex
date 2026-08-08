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
 *
 * WHY we navigate instead of installing directly from the grid:
 * Browsers only fire beforeinstallprompt for the CURRENTLY ACTIVE page.
 * You can't install a PWA from a different page. The /app/[id] page
 * has the correct manifest + SW registration to make the box installable.
 */

import { Download, Smartphone, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
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
};

function getStoreUrl(app: AppExt): string | null {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS     = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  // DB store fields first
  if (isIOS && app.store_ios) return app.store_ios;
  if (isAndroid && app.store_android) return app.store_android;
  if (app.store_android || app.store_ios) return app.store_android || app.store_ios || null;

  // Built-in map
  try {
    const domain = new URL(app.url).hostname.replace(/^www\./, "");
    const entry = NATIVE_STORES[domain];
    if (entry) return (isIOS ? entry.ios : entry.android) || entry.android || entry.ios || null;
  } catch { /* ignore */ }
  return null;
}

export default function InstallButton({ app, size = "md", className = "" }: InstallButtonProps) {
  const router = useRouter();
  const ext = app as AppExt;

  const storeUrl = getStoreUrl(ext);
  const isStore  = app.type === "store" || !!storeUrl;
  const isApk    = !isStore && (app.type === "apk" || app.url.toLowerCase().endsWith(".apk"));

  function handleClick() {
    // ── Store app: go to correct app store immediately ────────
    if (isStore) {
      window.location.href = storeUrl || app.url;
      return;
    }

    // ── APK: trigger direct download ─────────────────────────
    if (isApk) {
      const a = document.createElement("a");
      a.href = app.url;
      a.download = app.name.replace(/\s+/g, "-") + ".apk";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // ── PWA / Web: navigate to the box install page ───────────
    // The /app/[id] page has the correct manifest + service worker
    // registration that makes the browser show the native install prompt.
    // This is the only reliable way — browsers require the manifest and
    // SW to be loaded on the active page before showing the install dialog.
    router.push(`/app/${app.id}`);
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };
  const iconSize = { sm: 13, md: 15, lg: 17 }[size];

  const label = isApk ? "Download" : isStore ? "Get App" : "Install";
  const Icon  = isApk ? Download   : isStore ? Smartphone : CheckCircle;

  return (
    <button
      onClick={handleClick}
      aria-label={`${label} ${app.name}`}
      title={
        isStore ? "Opens the correct app store for your device" :
        isApk   ? "Downloads the APK file directly" :
                  "Opens the install page for this app box"
      }
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 select-none
        ${sizeClasses[size]}
        bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg
        hover:shadow-blue-500/30 hover:scale-105 active:scale-95
        ${className}
      `}
    >
      <Icon size={iconSize} />
      {label}
    </button>
  );
}
