"use client";

import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle, ExternalLink } from "lucide-react";
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

// Extended app type with optional store fields
type AppExt = App & {
  store_android?: string | null;
  store_ios?: string | null;
  store_windows?: string | null;
};

function getStoreTarget(app: AppExt): string {
  if (typeof navigator === "undefined") return app.url;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) && app.store_ios) return app.store_ios;
  if (/Android/.test(ua) && app.store_android) return app.store_android;
  if (/Windows NT/.test(ua) && !/Android/.test(ua) && app.store_windows) return app.store_windows;
  return app.store_android || app.store_ios || app.store_windows || app.url;
}

export default function InstallButton({ app, size = "md", className = "" }: InstallButtonProps) {
  const ext = app as AppExt;
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [pwaPromptReady, setPwaPromptReady] = useState(false);

  // Only listen for PWA install prompt
  useEffect(() => {
    if (app.type !== "pwa") return;
    if (deferredPrompts.has(app.url)) { setPwaPromptReady(true); return; }
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompts.set(app.url, e as BeforeInstallPromptEvent);
      setPwaPromptReady(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setPwaInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [app.url, app.type]);

  // ── Determine what this button does ──────────────────────────
  const hasStoreLinks = !!(ext.store_android || ext.store_ios || ext.store_windows);
  const isStore  = app.type === "store" || hasStoreLinks;
  const isApk    = app.type === "apk" || app.url.toLowerCase().endsWith(".apk");
  const isPwa    = app.type === "pwa" && !isStore && !isApk;
  const isWeb    = !isStore && !isApk && !isPwa;

  // ── Click handler — SYNCHRONOUS for store/web/apk ────────────
  // Never await before opening a URL — browsers block popups after async
  function handleClick() {
    // ── Store app: open correct store immediately ─────────────
    if (isStore) {
      window.location.href = getStoreTarget(ext);
      return;
    }

    // ── APK: trigger download immediately ────────────────────
    if (isApk) {
      const a = document.createElement("a");
      a.href = app.url;
      a.download = app.name.replace(/\s+/g, "-") + ".apk";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // ── PWA with native prompt ready: fire it ─────────────────
    if (isPwa && pwaPromptReady) {
      const deferred = deferredPrompts.get(app.url);
      if (deferred) {
        // This is synchronous up to the prompt call — browser allows it
        deferred.prompt().then(async () => {
          const { outcome } = await deferred.userChoice;
          if (outcome === "accepted") {
            setPwaInstalled(true);
            deferredPrompts.delete(app.url);
          }
        }).catch(() => {});
        return;
      }
    }

    // ── PWA without prompt / Web app: open in new tab ─────────
    // Must be synchronous (direct user gesture) — no await before this
    window.open(app.url, "_blank", "noopener,noreferrer");
  }

  // ── Label & icon ──────────────────────────────────────────────
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };
  const iconSize = { sm: 13, md: 15, lg: 17 }[size];

  const label =
    pwaInstalled                    ? "Installed"   :
    isStore                         ? "Get App"     :
    isApk                           ? "Install APK" :
    isPwa && pwaPromptReady         ? "Install"     :
    isPwa                           ? "Open"        :
                                      "Open";

  const Icon =
    pwaInstalled  ? CheckCircle  :
    isApk         ? Download     :
    isStore       ? Smartphone   :
    isPwa         ? Smartphone   :
                    ExternalLink;

  return (
    <button
      onClick={handleClick}
      disabled={pwaInstalled}
      aria-label={`${label} ${app.name}`}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 select-none
        ${sizeClasses[size]}
        ${pwaInstalled
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
