"use client";

/**
 * BoxInstallButton — installs the current page as a PWA box.
 *
 * Flow:
 *   1. This page loads with the manifest in <head> (same-origin start_url).
 *   2. BoxInstallButton registers a per-app service worker (/api/box/[id]/sw)
 *      scoped to /app/[id].
 *   3. Browser sees manifest + SW → evaluates installability.
 *   4. Browser fires beforeinstallprompt → we capture it and show the Install
 *      button. On click, prompt() triggers the native install dialog.
 *   5. Once installed, the box opens via start_url = /app/[id], and
 *      StandaloneRedirect bounces the user to the real external URL.
 *
 * On browsers that don't support beforeinstallprompt (iOS Safari, some
 * Android browsers, Firefox, Brave if shields up) we still show an
 * actionable install UI with clear manual steps.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Layers, CheckCircle, Loader2, RefreshCw, ExternalLink } from "lucide-react";

interface Props {
  app: { id: string; name: string; url?: string; type?: string };
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type ButtonState =
  | "init"       // mounting / registering SW / waiting for browser prompt
  | "ready"      // prompt captured — click me to install!
  | "prompting"  // native dialog is open
  | "done"       // installed successfully
  | "ios"        // iOS/iPadOS — no beforeinstallprompt, manual A2HS
  | "waiting"    // user clicked before prompt was ready; waiting longer
  | "unsupported"; // no prompt after max wait; manual install only

function isIOSOrIPadOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  // iPadOS 13+ pretends to be a Macintosh — check for touch capability
  if (
    /Macintosh/.test(ua) &&
    "maxTouchPoints" in navigator &&
    navigator.maxTouchPoints > 1
  ) {
    return true;
  }
  return false;
}

export default function BoxInstallButton({ app }: Props) {
  const [state, setState] = useState<ButtonState>(typeof window === "undefined" ? "init" : (isIOSOrIPadOS() ? "ios" : "init"));
  const [showManual, setShowManual] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const swRegistration = useRef<ServiceWorkerRegistration | null>(null);
  const readyTimer = useRef<number | null>(null);
  const waitTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    for (const ref of [readyTimer, waitTimer]) {
      if (ref.current != null) {
        try {
          clearTimeout(ref.current);
        } catch {
          /* ignore */
        }
        ref.current = null;
      }
    }
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = deferredPrompt.current;
    if (prompt) {
      setState("prompting");
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setState("done");
          deferredPrompt.current = null;
          try {
            await fetch("/api/install", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                app_id: app.id,
                platform: isIOSOrIPadOS()
                  ? "ios"
                  : /Android/.test(navigator.userAgent || "")
                    ? "android"
                    : "web",
              }),
            });
          } catch {
            /* silent — tracking failure is non-fatal */
          }
        } else {
          setState("ready");
        }
      } catch {
        setState("ready");
      }
      return;
    }

    // No prompt available yet — wait once, then fall back to manual install.
    // If user has already waited once → go straight to manual instructions.
    if (state === "waiting") {
      setShowManual(true);
      setState("unsupported");
      return;
    }

    if (state === "ready" || state === "init") {
      setState("waiting");
      try {
        if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
          navigator.serviceWorker
            .register(`/api/box/${app.id}/sw`, {
              scope: `/app/${app.id}`,
              updateViaCache: "none",
            })
            .then((reg) => {
              swRegistration.current = reg;
              try { reg.update(); } catch { /* ignore */ }
            })
            .catch(() => {});
        }
      } catch { /* ignore */ }

      if (waitTimer.current == null) {
        waitTimer.current = window.setTimeout(() => {
          if (!deferredPrompt.current) {
            setShowManual(true);
            setState("unsupported");
          } else {
            setState("ready");
          }
          waitTimer.current = null;
        }, 2500);
      }
    } else {
      setShowManual(true);
      setState("unsupported");
    }
  }, [app.id, state]);

  const handleRetry = useCallback(() => {
    clearTimers();
    deferredPrompt.current = null;
    setShowManual(false);
    setState("init");
    try {
      if (typeof window !== "undefined") window.location.reload();
    } catch {
      /* ignore */
    }
  }, [clearTimers]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      // Non-browser — no-op, don't render any button-like state until mount.
      setState("init");
      return;
    }

    // iOS / iPadOS: no beforeinstallprompt API at all → always manual A2HS
    if (isIOSOrIPadOS()) {
      setState("ios");
      return;
    }

    // Already running as an installed standalone PWA (or WCO desktop PWA)
    try {
      if (
        window.matchMedia &&
        (window.matchMedia("(display-mode: standalone)").matches ||
          window.matchMedia("(display-mode: window-controls-overlay)").matches)
      ) {
        setState("done");
        return;
      }
    } catch {
      /* ignore */
    }

    // No service worker support
    if (!("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }

    let cancelled = false;

    // ── Event handlers ─────────────────────────────────────
    const onPrompt = (e: Event) => {
      try {
        e.preventDefault();
      } catch {
        /* ignore */
      }
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setState((prev) => {
        if (
          prev === "done" ||
          prev === "prompting" ||
          prev === "ios" ||
          prev === "unsupported"
        ) {
          return prev;
        }
        return "ready";
      });
    };

    const onAppInstalled = () => {
      setState("done");
      deferredPrompt.current = null;
      try {
        fetch("/api/install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            app_id: app.id,
            platform: /Android/.test(navigator.userAgent || "") ? "android" : "web",
          }),
        }).catch(() => {});
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    // ── Register service worker ────────────────────────────
    navigator.serviceWorker
      .register(`/api/box/${app.id}/sw`, {
        scope: `/app/${app.id}`,
        updateViaCache: "none",
      })
      .then((reg) => {
        if (cancelled) return;
        swRegistration.current = reg;
        // Kick SW update to be sure latest is active.
        try {
          reg.update();
        } catch {
          /* ignore */
        }
        // Give the browser a reasonable window to evaluate installability.
        // Chromium needs manifest + active SW + user engagement. We wait up
        // to 4 seconds before falling back to manual-install instructions
        // so users always get actionable steps without waiting too long.
        readyTimer.current = window.setTimeout(() => {
          if (cancelled) return;
          if (!deferredPrompt.current) setShowManual(true);
          setState((prev) => {
            if (
              prev === "done" ||
              prev === "prompting" ||
              prev === "ios" ||
              prev === "unsupported"
            ) {
              return prev;
            }
            if (deferredPrompt.current) return "ready";
            return "unsupported";
          });
        }, 4000);
      })
      .catch(() => {
        if (cancelled) return;
        if (!deferredPrompt.current) setShowManual(true);
        setState((prev) => {
          if (
            prev === "done" ||
            prev === "prompting" ||
            prev === "ios" ||
            prev === "unsupported"
          ) {
            return prev;
          }
          return deferredPrompt.current ? "ready" : "unsupported";
        });
      });

    return () => {
      cancelled = true;
      clearTimers();
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [app.id, clearTimers]);

  const safeName = app.name ? app.name.replace(/\s+/g, " ").trim() : "this app";
  const isLoading = state === "init" || state === "prompting" || state === "waiting";

  // ── Done ─────────────────────────────────────────────────────
  if (state === "done") {
    return (
      <div className="space-y-2">
        <div className="w-full flex items-center justify-center gap-2 rounded-2xl bg-green-500/15 border border-green-500/25 py-4 text-sm font-bold text-green-400">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>Installed on your device!</span>
        </div>
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Find <strong className="text-white">{safeName}</strong> on your home screen.
          Tap it to open the app.
        </p>
      </div>
    );
  }

  // ── iOS / iPadOS ─────────────────────────────────────────────
  if (state === "ios") {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/8 p-4 space-y-3">
        <p className="text-sm font-bold text-white">Install on iPhone / iPad</p>
        <ol className="space-y-2">
          {[
            "Tap the Share button (□↑) in Safari",
            'Scroll down and tap "Add to Home Screen"',
            `Tap "Add" — ${safeName} appears on your home screen`,
          ].map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-xs text-gray-300 leading-relaxed"
            >
              <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-gray-500 text-center leading-relaxed">
          Installs a home screen shortcut — opens {safeName} directly when tapped.
        </p>
      </div>
    );
  }

  // ── Unsupported / Manual fallback (no prompt) ─────────────────
  // Always renders a clear, numbered step-by-step install guide
  // tailored to the detected platform, plus open-in-tab fallback.
  if (state === "unsupported" || showManual) {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    const isAndroid = /Android/.test(ua);
    const isChrome = /Chrome\//.test(ua) && !/Edg\//.test(ua);
    const isEdge = /Edg\//.test(ua);
    const isSamsung = /SamsungBrowser/.test(ua);
    const isFirefox = /Firefox\//.test(ua);
    const isDesktopChrome = isChrome && !isAndroid && !/Mobile/.test(ua);
    const isDesktopEdge = isEdge && !isAndroid && !/Mobile/.test(ua);
    const isDesktop = !isAndroid && !/Mobile|iPhone|iPad|iPod/.test(ua);

    let steps: string[] = [];
    let headerLabel = "Install on your device";
    let headerAccent = "from-blue-500 to-purple-600";

    if (isAndroid) {
      if (isSamsung) {
        steps = [
          "Tap the menu (☰) in the bottom-right of Samsung Internet",
          'Tap "Add page to" or "Install app"',
          `Select "Home screen" then tap Add — ${safeName} will appear`,
        ];
      } else if (isFirefox) {
        steps = [
          "Tap the menu (⋮) in the bottom-right of Firefox",
          'Scroll and tap "Install" or "Add to Home screen"',
          `Tap "Add automatically" — ${safeName} is on your home screen`,
        ];
      } else {
        steps = [
          "Tap the menu (⋮) in the top-right of Chrome",
          `Tap "Install app" or "Add to Home screen" near the top`,
          `Tap "Install" — ${safeName} appears on your home screen`,
        ];
      }
    } else if (isDesktopChrome || isDesktopEdge) {
      const browser = isDesktopEdge ? "Edge" : "Chrome";
      headerLabel = `Install in ${browser}`;
      steps = [
        `Look for the ⊕ Install icon on the right side of the ${browser} address bar`,
        `Click it and confirm "Install" in the popup`,
        `${safeName} opens in its own window like a native app`,
      ];
    } else if (isFirefox && isDesktop) {
      steps = [
        "Click the menu (☰) in the top-right of Firefox",
        "Find the page actions menu near the address bar",
        `Use "Install site as app" or "Pin to taskbar" for ${safeName}`,
      ];
    } else {
      // Generic desktop / other browser catch-all
      steps = [
        `Open your browser's menu (☰ or ⋮) in the top corner`,
        'Look for "Install app", "Add to Home Screen", or "Create shortcut"',
        `Confirm — ${safeName} launches directly from your desktop or home screen`,
      ];
    }

    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">{headerLabel}</p>
            <span className={`inline-block rounded-full bg-gradient-to-r ${headerAccent} h-1.5 w-12`} />
          </div>
          <ol className="space-y-2.5">
            {steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs text-gray-300 leading-relaxed"
              >
                <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-gray-500 text-center leading-relaxed pt-1 border-t border-white/5">
            Installs a shortcut — opens <strong className="text-white">{safeName}</strong> directly when tapped.
          </p>
        </div>

        {app.url && (
          <button
            type="button"
            onClick={() => {
              try { window.open(app.url!, "_blank", "noopener,noreferrer"); }
              catch { try { window.location.assign(app.url!); } catch { /* ignore */ } }
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open app now
          </button>
        )}

        <button
          type="button"
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try automatic install
        </button>
      </div>
    );
  }

  // ── Loading / Ready / Waiting / Prompting (main CTA button) ──
  const buttonDisabled = state === "prompting";

  const buttonLabel =
    state === "prompting"
      ? "Installing…"
      : state === "waiting"
        ? "Waiting for browser…"
        : state === "init"
          ? "Preparing install…"
          : `Install ${safeName}`;

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={handleInstall}
        disabled={buttonDisabled}
        aria-busy={isLoading}
        aria-disabled={buttonDisabled}
        aria-label={`Install ${safeName}`}
        className={`
          w-full flex items-center justify-center gap-3 rounded-2xl py-4 px-4
          text-sm font-bold transition-all duration-150 select-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
          ${state === "prompting"
            ? "bg-white/5 border border-white/10 text-gray-500 cursor-wait"
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl md:hover:shadow-blue-500/30 md:hover:scale-[1.01] active:scale-[0.985] cursor-pointer transform-gpu will-change-transform"
          }
        `}
      >
        {isLoading ? (
          <Loader2
            className="h-5 w-5 flex-shrink-0 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Layers className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        )}
        <span className="truncate">{buttonLabel}</span>
      </button>

      {(state === "ready" || state === "init" || state === "waiting") && (
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="w-full text-center text-[11px] text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors py-1"
        >
          Can&apos;t install? Show manual steps
        </button>
      )}

      {state === "ready" && (
        <p className="text-[11px] text-gray-500 text-center leading-relaxed">
          Installs a home screen shortcut — opens {safeName} directly when tapped.
        </p>
      )}
      {state === "init" && (
        <p className="text-[11px] text-gray-500 text-center leading-relaxed">
          Checking if your browser can install {safeName}…
        </p>
      )}
      {state === "waiting" && (
        <p className="text-[11px] text-gray-500 text-center leading-relaxed">
          Still preparing the install prompt — hold on a moment.
        </p>
      )}

      {app.url && (state === "ready" || state === "waiting") && (
        <button
          type="button"
          onClick={() => {
            try { window.open(app.url!, "_blank", "noopener,noreferrer"); }
            catch { try { window.location.assign(app.url!); } catch { /* ignore */ } }
          }}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors py-1"
        >
          <ExternalLink className="h-3 w-3" />
          Or open {safeName} in a new tab
        </button>
      )}
    </div>
  );
}
