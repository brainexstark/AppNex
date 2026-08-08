"use client";

/**
 * BoxInstallButton
 *
 * This component does ONE thing: install the current page as a PWA.
 *
 * The page already has:
 *   <link rel="manifest" href="/api/box/[id]/manifest">
 *
 * That manifest has start_url = the app's real URL, so the
 * installed icon opens the real app. But the BOX itself is what
 * gets installed — it's a PWA wrapper, not the app files.
 *
 * No URL routing. No store detection. No open-in-tab.
 * Just: register SW → capture beforeinstallprompt → call prompt().
 */

import { useState, useEffect, useRef } from "react";
import { Layers, CheckCircle, Loader2 } from "lucide-react";

interface Props {
  app: { id: string; name: string };
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function BoxInstallButton({ app }: Props) {
  const [state, setState] = useState<
    "init" | "ready" | "prompting" | "done" | "ios" | "unsupported"
  >("init");
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // iOS Safari doesn't support beforeinstallprompt
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      setState("ios");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }

    // Already running as installed PWA — no need to show install button
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setState("done");
      return;
    }

    // Capture the install prompt the moment the browser fires it
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setState("ready");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setState("done"));

    // Register the per-app service worker.
    // Once the SW is active + manifest is present → browser fires beforeinstallprompt.
    navigator.serviceWorker
      .register(`/api/box/${app.id}/sw`, { scope: `/app/${app.id}` })
      .then(() => {
        // Give browser time to evaluate — if it already fired before registration
        // we won't get another event, but the prompt ref may already be set.
        setTimeout(() => {
          setState((prev) => {
            if (prev === "init") return deferredPrompt.current ? "ready" : "unsupported";
            return prev;
          });
        }, 2000);
      })
      .catch(() => setState("unsupported"));

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [app.id]);

  async function handleInstall() {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    setState("prompting");
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      setState(outcome === "accepted" ? "done" : "ready");
      if (outcome === "accepted") deferredPrompt.current = null;
    } catch {
      setState("ready");
    }
  }

  // ── Done ─────────────────────────────────────────────────────
  if (state === "done") return (
    <div className="space-y-2">
      <div className="w-full flex items-center justify-center gap-2 rounded-2xl bg-green-500/15 border border-green-500/25 py-4 text-sm font-bold text-green-400">
        <CheckCircle className="h-5 w-5" />
        Installed on your device!
      </div>
      <p className="text-xs text-gray-500 text-center">
        Find <strong className="text-white">{app.name}</strong> on your home screen.
        Tap it to open the app.
      </p>
    </div>
  );

  // ── iOS (no beforeinstallprompt support) ─────────────────────
  if (state === "ios") return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/8 p-4 space-y-3">
      <p className="text-sm font-bold text-white">Add to Home Screen</p>
      <ol className="space-y-2">
        {[
          'Tap the Share button (□↑) at the bottom of Safari',
          'Tap "Add to Home Screen"',
          `Tap "Add" — ${app.name} appears on your home screen`,
        ].map((step, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
            <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <p className="text-[11px] text-gray-600 text-center">
        The shortcut opens {app.name} directly — no browser bar
      </p>
    </div>
  );

  // ── Unsupported browser ───────────────────────────────────────
  if (state === "unsupported") return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-center space-y-2">
      <p className="text-sm font-bold text-white">Install as shortcut</p>
      <p className="text-xs text-gray-400">
        In Chrome or Edge, click the <strong>⊕</strong> icon in the address bar to install.
        In other browsers, use &ldquo;Add to Home Screen&rdquo; from the menu.
      </p>
    </div>
  );

  // ── Loading / Ready / Prompting ───────────────────────────────
  const isLoading = state === "init" || state === "prompting";
  return (
    <div className="space-y-2">
      <button
        onClick={handleInstall}
        disabled={isLoading || state !== "ready"}
        className={`
          w-full flex items-center justify-center gap-3 rounded-2xl py-4
          text-sm font-bold transition-all duration-150 select-none
          ${isLoading
            ? "bg-white/5 border border-white/10 text-gray-500 cursor-wait"
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
          }
        `}
      >
        {isLoading
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <Layers className="h-5 w-5" />
        }
        {state === "init"      ? "Preparing…" :
         state === "prompting" ? "Installing…" :
                                 `Install ${app.name}`}
      </button>
      {state === "ready" && (
        <p className="text-[11px] text-gray-500 text-center">
          Installs a home screen shortcut — opens {app.name} directly when tapped
        </p>
      )}
    </div>
  );
}
