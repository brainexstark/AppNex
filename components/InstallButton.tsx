"use client";

import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle } from "lucide-react";
import type { App } from "@/lib/types";

interface InstallButtonProps {
  app: App;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const deferredPrompts = new Map<string, BeforeInstallPromptEvent>();

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type AppExt = App & {
  store_android?: string | null;
  store_ios?: string | null;
  store_windows?: string | null;
};

// Known native apps — maps domain to store links
// Used as fallback when DB doesn't have store columns yet
const NATIVE_STORE_MAP: Record<string, { android?: string; ios?: string; windows?: string }> = {
  "tiktok.com":     { android: "https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically", ios: "https://apps.apple.com/app/tiktok/id835599320" },
  "instagram.com":  { android: "https://play.google.com/store/apps/details?id=com.instagram.android", ios: "https://apps.apple.com/app/instagram/id389801252" },
  "facebook.com":   { android: "https://play.google.com/store/apps/details?id=com.facebook.katana", ios: "https://apps.apple.com/app/facebook/id284882215" },
  "twitter.com":    { android: "https://play.google.com/store/apps/details?id=com.twitter.android", ios: "https://apps.apple.com/app/x/id333903271" },
  "x.com":          { android: "https://play.google.com/store/apps/details?id=com.twitter.android", ios: "https://apps.apple.com/app/x/id333903271" },
  "snapchat.com":   { android: "https://play.google.com/store/apps/details?id=com.snapchat.android", ios: "https://apps.apple.com/app/snapchat/id447188370" },
  "youtube.com":    { android: "https://play.google.com/store/apps/details?id=com.google.android.youtube", ios: "https://apps.apple.com/app/youtube/id544007664" },
  "whatsapp.com":   { android: "https://play.google.com/store/apps/details?id=com.whatsapp", ios: "https://apps.apple.com/app/whatsapp/id310633997" },
  "telegram.org":   { android: "https://play.google.com/store/apps/details?id=org.telegram.messenger", ios: "https://apps.apple.com/app/telegram/id686449807" },
  "spotify.com":    { android: "https://play.google.com/store/apps/details?id=com.spotify.music", ios: "https://apps.apple.com/app/spotify/id324684580" },
  "netflix.com":    { android: "https://play.google.com/store/apps/details?id=com.netflix.mediaclient", ios: "https://apps.apple.com/app/netflix/id363590051" },
  "discord.com":    { android: "https://play.google.com/store/apps/details?id=com.discord", ios: "https://apps.apple.com/app/discord/id985746746" },
  "reddit.com":     { android: "https://play.google.com/store/apps/details?id=com.reddit.frontpage", ios: "https://apps.apple.com/app/reddit/id1064216828" },
  "linkedin.com":   { android: "https://play.google.com/store/apps/details?id=com.linkedin.android", ios: "https://apps.apple.com/app/linkedin/id288429040" },
  "pinterest.com":  { android: "https://play.google.com/store/apps/details?id=com.pinterest", ios: "https://apps.apple.com/app/pinterest/id429047995" },
  "uber.com":       { android: "https://play.google.com/store/apps/details?id=com.ubercab", ios: "https://apps.apple.com/app/uber/id368677368" },
  "amazon.com":     { android: "https://play.google.com/store/apps/details?id=com.amazon.mShop.android.shopping", ios: "https://apps.apple.com/app/amazon/id297606951" },
  "threads.net":    { android: "https://play.google.com/store/apps/details?id=com.instagram.barcelona", ios: "https://apps.apple.com/app/threads/id6446901002" },
  "zoom.us":        { android: "https://play.google.com/store/apps/details?id=us.zoom.videomeetings", ios: "https://apps.apple.com/app/zoom/id546505307" },
};

function getStoreUrl(app: AppExt): string | null {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isWindows = /Windows NT/.test(ua) && !/Android/.test(ua);

  // 1. Use store fields from DB if available
  if (isIOS && app.store_ios) return app.store_ios;
  if (isAndroid && app.store_android) return app.store_android;
  if (isWindows && app.store_windows) return app.store_windows;
  if (app.store_android || app.store_ios) {
    return app.store_android || app.store_ios || null;
  }

  // 2. Fall back to built-in map using app URL domain
  try {
    const domain = new URL(app.url).hostname.replace(/^www\./, "");
    const entry = NATIVE_STORE_MAP[domain];
    if (entry) {
      if (isIOS && entry.ios) return entry.ios;
      if (isAndroid && entry.android) return entry.android;
      if (isWindows && entry.windows) return entry.windows;
      return entry.android || entry.ios || null;
    }
  } catch { /* ignore */ }

  return null;
}

export default function InstallButton({ app, size = "md", className = "" }: InstallButtonProps) {
  const ext = app as AppExt;
  const [installed, setInstalled] = useState(false);
  const [pwaPromptReady, setPwaPromptReady] = useState(false);

  useEffect(() => {
    if (app.type !== "pwa") return;
    if (deferredPrompts.has(app.url)) { setPwaPromptReady(true); return; }
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompts.set(app.url, e as BeforeInstallPromptEvent);
      setPwaPromptReady(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [app.url, app.type]);

  function handleClick() {
    if (installed) return;

    // ── 1. Native/Store app — route to correct store ──────────
    const storeUrl = getStoreUrl(ext);
    if (app.type === "store" || storeUrl) {
      // Use location.href — lets the OS intercept and open the store app
      window.location.href = storeUrl || app.url;
      return;
    }

    // ── 2. APK — direct download ──────────────────────────────
    if (app.type === "apk" || app.url.toLowerCase().endsWith(".apk")) {
      const a = document.createElement("a");
      a.href = app.url;
      a.download = app.name.replace(/\s+/g, "-") + ".apk";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // ── 3. PWA with native install prompt ─────────────────────
    if (app.type === "pwa" && pwaPromptReady) {
      const deferred = deferredPrompts.get(app.url);
      if (deferred) {
        deferred.prompt().then(async () => {
          const { outcome } = await deferred.userChoice;
          if (outcome === "accepted") {
            setInstalled(true);
            deferredPrompts.delete(app.url);
          }
        }).catch(() => {});
        return;
      }
    }

    // ── 4. PWA without prompt / Web app ───────────────────────
    // Open in new tab — this IS the install mechanism for web apps
    // (user can then use browser's "Add to Home Screen")
    window.open(app.url, "_blank", "noopener,noreferrer");
  }

  // ── Determine label ───────────────────────────────────────────
  const storeUrl = getStoreUrl(ext);
  const isNative = app.type === "store" || !!storeUrl;
  const isApk    = !isNative && (app.type === "apk" || app.url.toLowerCase().endsWith(".apk"));
  const isPwa    = !isNative && !isApk && app.type === "pwa";

  const label = installed ? "Installed" : "Install";

  const Icon = installed ? CheckCircle : isApk ? Download : Smartphone;

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };
  const iconSize = { sm: 13, md: 15, lg: 17 }[size];

  // Tooltip to explain what will happen
  const title =
    installed   ? "Already installed"                          :
    isNative    ? "Opens the app store for your device"        :
    isApk       ? "Downloads the APK file"                     :
    isPwa       ? (pwaPromptReady ? "Install this app" : "Open app to install") :
                  "Open app";

  return (
    <button
      onClick={handleClick}
      disabled={installed}
      title={title}
      aria-label={`${label} ${app.name}`}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 select-none
        ${sizeClasses[size]}
        ${installed
          ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
        }
        ${className}
      `}
    >
      <Icon size={iconSize} />
      {label}
    </button>
  );
}
