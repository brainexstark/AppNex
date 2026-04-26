"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import type { App } from "@/lib/types";

interface InstallButtonProps {
  app: App;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Global store for deferred install prompts, keyed by app URL
const deferredPrompts = new Map<string, BeforeInstallPromptEvent>();

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButton({ app, size = "md", className = "" }: InstallButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "installing" | "done">("idle");
  const [hasPrompt, setHasPrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Only PWAs can have a native install prompt
    if (app.type !== "pwa") return;

    // Check if we already captured a prompt for this URL
    if (deferredPrompts.has(app.url)) {
      setHasPrompt(true);
      return;
    }

    // Listen for the browser's beforeinstallprompt event
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

  async function handleInstall() {
    if (state === "done") return;

    // ── APK: direct download, no page open ───────────────────
    if (app.type === "apk") {
      const a = document.createElement("a");
      a.href = app.url;
      a.download = "";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setState("done");
      setTimeout(() => setState("idle"), 5000);
      return;
    }

    // ── PWA with captured prompt: fire it directly ────────────
    if (app.type === "pwa" && hasPrompt) {
      const deferred = deferredPrompts.get(app.url);
      if (deferred) {
        setState("installing");
        try {
          await deferred.prompt();
          const { outcome } = await deferred.userChoice;
          setState(outcome === "accepted" ? "done" : "idle");
          if (outcome === "accepted") deferredPrompts.delete(app.url);
        } catch {
          setState("idle");
        }
        return;
      }
    }

    // ── PWA without prompt yet: load the PWA in a hidden iframe
    //    to trigger the service worker registration, which may
    //    cause the browser to fire beforeinstallprompt.
    //    Then fire the prompt if it arrives within 5s.
    if (app.type === "pwa") {
      setState("loading");

      // Create hidden iframe to load the PWA
      const iframe = document.createElement("iframe");
      iframe.src = app.url;
      iframe.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:none;";
      document.body.appendChild(iframe);
      iframeRef.current = iframe;

      // Wait up to 5 seconds for the prompt to fire
      const promptReceived = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);

        const check = setInterval(() => {
          if (deferredPrompts.has(app.url)) {
            clearTimeout(timeout);
            clearInterval(check);
            resolve(true);
          }
        }, 200);
      });

      // Clean up iframe
      if (iframeRef.current) {
        document.body.removeChild(iframeRef.current);
        iframeRef.current = null;
      }

      if (promptReceived) {
        const deferred = deferredPrompts.get(app.url);
        if (deferred) {
          setState("installing");
          try {
            await deferred.prompt();
            const { outcome } = await deferred.userChoice;
            setState(outcome === "accepted" ? "done" : "idle");
            if (outcome === "accepted") deferredPrompts.delete(app.url);
          } catch {
            setState("idle");
          }
          return;
        }
      }

      // Prompt never fired — PWA doesn't meet installability criteria.
      // Open it directly so the user can install from the browser's own UI.
      setState("idle");
      window.open(app.url, "_blank", "noopener,noreferrer");
      return;
    }

    // ── Web app: open in new tab (browser handles Add to Home Screen) ──
    window.open(app.url, "_blank", "noopener,noreferrer");
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };
  const iconSize = { sm: 13, md: 15, lg: 17 }[size];

  const label =
    state === "done"      ? "Installed" :
    state === "loading"   ? "Loading…"  :
    state === "installing"? "Installing…":
    app.type === "apk"    ? "Install"   :
                            "Install";

  const Icon =
    state === "done"       ? CheckCircle :
    state === "loading" || state === "installing" ? Loader2 :
    app.type === "apk"     ? Download    :
                             Smartphone;

  return (
    <button
      onClick={handleInstall}
      disabled={state === "done" || state === "loading" || state === "installing"}
      aria-label={`${label} ${app.name}`}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 select-none
        ${sizeClasses[size]}
        ${state === "done"
          ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
          : state === "loading" || state === "installing"
          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-wait"
          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
        }
        ${className}
      `}
    >
      <Icon
        size={iconSize}
        className={state === "loading" || state === "installing" ? "animate-spin" : ""}
      />
      {label}
    </button>
  );
}
