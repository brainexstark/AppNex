"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Smartphone, CheckCircle, Loader2, ExternalLink } from "lucide-react";
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

// ── Detect the best install action from the app data ──────────
// Works even if the DB type is wrong — uses URL + store fields
function resolveAction(app: App): {
  kind: "pwa-prompt" | "apk-download" | "store-redirect" | "web-open";
  target: string;
} {
  const ext = app as App & {
    store_android?: string | null;
    store_ios?: string | null;
    store_windows?: string | null;
  };

  // 1. Has store links → native app, route to correct store
  const hasStoreLinks = ext.store_android || ext.store_ios || ext.store_windows;
  if (app.type === "store" || hasStoreLinks) {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isWindows = /Windows NT/.test(ua) && !/Android/.test(ua);

    let target = "";
    if (isIOS && ext.store_ios) target = ext.store_ios;
    else if (isAndroid && ext.store_android) target = ext.store_android;
    else if (isWindows && ext.store_windows) target = ext.store_windows;
    else target = ext.store_android || ext.store_ios || ext.store_windows || app.url;

    return { kind: "store-redirect", target };
  }

  // 2. APK direct download
  if (app.type === "apk" || app.url.toLowerCase().endsWith(".apk")) {
    return { kind: "apk-download", target: app.url };
  }

  // 3. PWA — handled separately (needs async prompt check)
  if (app.type === "pwa") {
    return { kind: "pwa-prompt", target: app.url };
  }

  // 4. Web app — open in new tab
  return { kind: "web-open", target: app.url };
}

export default function InstallButton({ app, size = "md", className = "" }: InstallButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [hasPrompt, setHasPrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (app.type !== "pwa") return;
    if (deferredPrompts.has(app.url)) { setHasPrompt(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompts.set(app.url, e as BeforeInstallPromptEvent);
      setHasPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setState("done");
      deferredPrompts.delete(app.url);
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [app.url, app.type]);

  async function handleClick() {
    if (state === "done") return;

    const action = resolveAction(app);

    // ── Store redirect ────────────────────────────────────────
    if (action.kind === "store-redirect") {
      // window.location.href lets the OS intercept and open the store app
      window.location.href = action.target;
      return;
    }

    // ── APK download ──────────────────────────────────────────
    if (action.kind === "apk-download") {
      const a = document.createElement("a");
      a.href = action.target;
      a.download = app.name.replace(/\s+/g, "-") + ".apk";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setState("done");
      setTimeout(() => setState("idle"), 4000);
      return;
    }

    // ── PWA: try native prompt first ──────────────────────────
    if (action.kind === "pwa-prompt") {
      // Already have a deferred prompt — fire it
      if (hasPrompt) {
        const deferred = deferredPrompts.get(app.url);
        if (deferred) {
          try {
            await deferred.prompt();
            const { outcome } = await deferred.userChoice;
            if (outcome === "accepted") {
              setState("done");
              deferredPrompts.delete(app.url);
            }
          } catch { /* ignore */ }
          return;
        }
      }

      // No prompt yet — load the PWA in a hidden iframe to trigger SW registration
      setState("loading");
      const iframe = document.createElement("iframe");
      iframe.src = action.target;
      iframe.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:none;top:-9999px;left:-9999px;";
      document.body.appendChild(iframe);
      iframeRef.current = iframe;

      const promptArrived = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 6000);
        const poll = setInterval(() => {
          if (deferredPrompts.has(app.url)) {
            clearTimeout(timeout);
            clearInterval(poll);
            resolve(true);
          }
        }, 300);
      });

      if (iframeRef.current) {
        document.body.removeChild(iframeRef.current);
        iframeRef.current = null;
      }
      setState("idle");

      if (promptArrived) {
        const deferred = deferredPrompts.get(app.url);
        if (deferred) {
          try {
            await deferred.prompt();
            const { outcome } = await deferred.userChoice;
            if (outcome === "accepted") {
              setState("done");
              deferredPrompts.delete(app.url);
            }
          } catch { /* ignore */ }
          return;
        }
      }

      // PWA doesn't meet installability criteria — open it so user can install from browser
      window.open(action.target, "_blank", "noopener,noreferrer");
      return;
    }

    // ── Web app: open in new tab ──────────────────────────────
    window.open(action.target, "_blank", "noopener,noreferrer");
  }

  // ── Derive label + icon from resolved action ──────────────
  const action = resolveAction(app);

  const label =
    state === "done"    ? "Installed" :
    state === "loading" ? "Loading…"  :
    action.kind === "apk-download"   ? "Install APK" :
    action.kind === "store-redirect" ? "Get App"     :
    action.kind === "pwa-prompt"     ? "Install"     :
                                       "Open";

  const Icon =
    state === "done"    ? CheckCircle :
    state === "loading" ? Loader2     :
    action.kind === "apk-download"   ? Download    :
    action.kind === "store-redirect" ? Smartphone  :
    action.kind === "pwa-prompt"     ? Smartphone  :
                                       ExternalLink;

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };
  const iconSize = { sm: 13, md: 15, lg: 17 }[size];

  return (
    <button
      onClick={handleClick}
      disabled={state === "done" || state === "loading"}
      aria-label={`${label} ${app.name}`}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 select-none
        ${sizeClasses[size]}
        ${state === "done"
          ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
          : state === "loading"
          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-wait"
          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
        }
        ${className}
      `}
    >
      <Icon
        size={iconSize}
        className={state === "loading" ? "animate-spin" : ""}
      />
      {label}
    </button>
  );
}
