"use client";

/**
 * BoxInstallButton
 *
 * This is the heart of AppNex's "box" concept.
 *
 * When clicked:
 * 1. Registers a per-app service worker at /api/box/[id]/sw
 *    — this makes the /app/[id] page PWA-installable
 * 2. The page already has <link rel="manifest" href="/api/box/[id]/manifest">
 *    — that manifest's start_url IS the app's real URL
 * 3. Triggers the browser's beforeinstallprompt → native install dialog
 * 4. When the user accepts → the box is installed on their home screen/taskbar
 * 5. Tapping the installed box icon opens the REAL app URL in standalone mode
 *
 * For APKs: downloads the APK file directly
 * For Store apps: routes to the correct app store
 */

import { useState, useEffect, useRef } from "react";
import { Layers, Download, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import type { App } from "@/lib/types";

interface Props {
  app: App;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type AppExt = App & {
  store_android?: string | null;
  store_ios?: string | null;
  store_windows?: string | null;
};

const KNOWN_STORES: Record<string, { android?: string; ios?: string }> = {
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
};

function getStoreUrl(app: AppExt): string | null {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS     = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  // DB store fields
  if (isIOS && app.store_ios) return app.store_ios;
  if (isAndroid && app.store_android) return app.store_android;
  if (app.store_android || app.store_ios) return app.store_android || app.store_ios || null;
  // Built-in map
  try {
    const domain = new URL(app.url).hostname.replace(/^www\./, "");
    const entry = KNOWN_STORES[domain];
    if (entry) {
      if (isIOS && entry.ios) return entry.ios;
      if (isAndroid && entry.android) return entry.android;
      return entry.android || entry.ios || null;
    }
  } catch { /* ignore */ }
  return null;
}

export default function BoxInstallButton({ app }: Props) {
  const ext = app as AppExt;
  const [phase, setPhase] = useState<"idle" | "registering" | "ready" | "installing" | "done">("idle");
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // On mount, register the per-app service worker
  // This makes this page installable as a standalone PWA
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isApk   = app.type === "apk" || app.url.toLowerCase().endsWith(".apk");
    const storeUrl = getStoreUrl(ext);
    // APK and store apps don't need a SW
    if (isApk || (app.type === "store" && storeUrl)) return;

    // Listen for the install prompt BEFORE registering the SW
    const promptHandler = (e: Event) => {
      e.preventDefault();
      const pe = e as BeforeInstallPromptEvent;
      promptRef.current = pe;
      setPrompt(pe);
      setPhase("ready");
    };
    window.addEventListener("beforeinstallprompt", promptHandler);
    window.addEventListener("appinstalled", () => setPhase("done"));

    // Register the per-app service worker
    setPhase("registering");
    navigator.serviceWorker
      .register(`/api/box/${app.id}/sw`, { scope: "/" })
      .then(() => {
        // SW registered — browser may now fire beforeinstallprompt
        // Give it a moment then check if we already have a prompt
        setTimeout(() => {
          if (promptRef.current) {
            setPhase("ready");
          } else {
            // SW registered but no prompt yet — check if page is installable
            // Some browsers fire the event only after a brief delay
            setPhase("ready"); // Allow clicking — we'll handle gracefully
          }
        }, 800);
      })
      .catch(() => {
        setPhase("ready"); // Still allow clicking even if SW fails
      });

    return () => {
      window.removeEventListener("beforeinstallprompt", promptHandler);
    };
  }, [app.id, app.type, app.url, ext]);

  async function handleClick() {
    if (phase === "done") return;

    const storeUrl = getStoreUrl(ext);
    const isApk = app.type === "apk" || app.url.toLowerCase().endsWith(".apk");

    // ── Store apps: go to correct store ──────────────────────
    if (app.type === "store" || storeUrl) {
      window.location.href = storeUrl || app.url;
      return;
    }

    // ── APK: trigger download ─────────────────────────────────
    if (isApk) {
      const a = document.createElement("a");
      a.href = app.url;
      a.download = app.name.replace(/\s+/g, "-") + ".apk";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setPhase("done");
      setTimeout(() => setPhase("idle"), 5000);
      return;
    }

    // ── PWA / Web box: trigger native install prompt ──────────
    const p = prompt || promptRef.current;
    if (p) {
      setPhase("installing");
      try {
        await p.prompt();
        const { outcome } = await p.userChoice;
        setPhase(outcome === "accepted" ? "done" : "idle");
      } catch {
        setPhase("idle");
      }
      return;
    }

    // No prompt available yet — the app may not meet PWA criteria
    // Fall back: open in new tab with install hint
    window.open(app.url, "_blank", "noopener,noreferrer");
  }

  // ── Determine button appearance ───────────────────────────────
  const storeUrl = getStoreUrl(ext);
  const isApk   = app.type === "apk" || app.url.toLowerCase().endsWith(".apk");
  const isStore = app.type === "store" || !!storeUrl;

  const config = {
    idle:        { label: "Install Box",     icon: Layers,       spin: false },
    registering: { label: "Preparing box…",  icon: Loader2,      spin: true  },
    ready:       { label: "Install Box",     icon: Layers,       spin: false },
    installing:  { label: "Installing…",     icon: Loader2,      spin: true  },
    done:        { label: "Box Installed ✓", icon: CheckCircle,  spin: false },
  };

  // Override for specific types
  const label =
    phase === "done"      ? "Installed ✓"     :
    phase === "installing"? "Installing…"      :
    phase === "registering"?"Preparing…"       :
    isApk                 ? "Download & Install" :
    isStore               ? "Get from Store"    :
                            "Install Box";

  const Icon =
    phase === "done"                        ? CheckCircle :
    phase === "installing" || phase === "registering" ? Loader2  :
    isApk                                   ? Download    :
    isStore                                 ? Smartphone  :
                                              Layers;

  void config; // unused destructure suppression

  return (
    <div className="space-y-3">
      {/* Main install button */}
      <button
        onClick={handleClick}
        disabled={phase === "done" || phase === "installing" || phase === "registering"}
        className={`
          w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold
          transition-all duration-200 select-none
          ${phase === "done"
            ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
            : phase === "installing" || phase === "registering"
            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-wait"
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
          }
        `}
      >
        <Icon
          className={`h-5 w-5 ${phase === "installing" || phase === "registering" ? "animate-spin" : ""}`}
        />
        {label}
      </button>

      {/* What happens explanation */}
      {phase === "idle" || phase === "registering" || phase === "ready" ? (
        <div className="rounded-xl bg-white/3 border border-white/5 p-3">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            {isApk
              ? "📦 Downloads the APK file directly to your device"
              : isStore
              ? "📱 Opens the correct app store for your device"
              : "📲 Installs a home screen shortcut that opens this app directly — nothing is downloaded to our servers"
            }
          </p>
        </div>
      ) : null}

      {phase === "done" && !isApk && !isStore && (
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3">
          <p className="text-xs text-green-400 text-center font-medium">
            ✓ Box installed! Find <strong>{app.name}</strong> on your home screen or app drawer
          </p>
        </div>
      )}
    </div>
  );
}
