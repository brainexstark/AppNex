"use client";

/**
 * BoxInstallButton
 *
 * Creates a home screen SHORTCUT for any app or website.
 *
 * The box IS the installable thing — a tiny PWA wrapper whose
 * start_url points to the real app. Installing it puts an icon
 * on the home screen. Tapping opens the app in standalone mode.
 *
 * Works for Facebook, YouTube, random blogs — anything with a URL.
 */

import { useState, useEffect, useRef } from "react";
import { Layers, CheckCircle, Loader2, Smartphone } from "lucide-react";
import type { App } from "@/lib/types";

interface Props { app: App }

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Phase = "loading" | "ready" | "prompting" | "done" | "manual";

function detectPlatform() {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export default function BoxInstallButton({ app }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const platform = detectPlatform();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) { setPhase("manual"); return; }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
      setPhase("ready");
    };
    const onInstalled = () => setPhase("done");

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Register the per-app service worker so the browser considers this page installable
    navigator.serviceWorker.register(`/api/box/${app.id}/sw`, { scope: "/" })
      .then(() => {
        setTimeout(() => {
          setPhase(p => p === "loading" ? (promptRef.current ? "ready" : "manual") : p);
        }, 1500);
      })
      .catch(() => setPhase("manual"));

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [app.id]);

  async function handleInstall() {
    // Native prompt available — trigger it directly
    if (promptRef.current) {
      setPhase("prompting");
      try {
        await promptRef.current.prompt();
        const { outcome } = await promptRef.current.userChoice;
        setPhase(outcome === "accepted" ? "done" : "ready");
        if (outcome === "accepted") promptRef.current = null;
      } catch { setPhase("ready"); }
      return;
    }
    // No prompt — show manual instructions
    setPhase("manual");
  }

  // ── Done state ────────────────────────────────────────────
  if (phase === "done") return (
    <div className="space-y-3">
      <div className="w-full flex items-center justify-center gap-3 rounded-2xl bg-green-500/15 border border-green-500/25 py-4 text-sm font-bold text-green-400">
        <CheckCircle className="h-5 w-5" />
        Shortcut installed!
      </div>
      <p className="text-xs text-gray-500 text-center">
        Find <strong className="text-white">{app.name}</strong> on your home screen.
        Tap it to open the app directly — no browser bar.
      </p>
    </div>
  );

  // ── Manual instructions (iOS / unsupported) ───────────────
  if (phase === "manual") {
    const steps =
      platform === "ios" ? [
        "Tap the Share button (□↑) at the bottom of Safari",
        'Scroll down and tap "Add to Home Screen"',
        `Rename it "${app.name}" if you want, then tap Add`,
      ] :
      platform === "android" ? [
        "Tap the three-dot menu (⋮) in Chrome",
        '"Add to Home screen" or "Install app"',
        "Tap Add / Install to confirm",
      ] : [
        "Look for the ⊕ install icon in Chrome/Edge's address bar",
        "Click it and select Install",
      ];

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/8 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="h-5 w-5 text-blue-400" />
            <p className="text-sm font-bold text-white">Add to Home Screen</p>
          </div>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <p className="text-[11px] text-gray-600 text-center">
          The shortcut opens <strong className="text-gray-400">{app.name}</strong> directly — no browser chrome.
        </p>
      </div>
    );
  }

  // ── Loading / ready / prompting ───────────────────────────
  return (
    <div className="space-y-3">
      <button
        onClick={handleInstall}
        disabled={phase === "loading" || phase === "prompting"}
        className={`
          w-full flex items-center justify-center gap-3 rounded-2xl py-4
          text-sm font-bold transition-all duration-150 select-none
          ${phase === "loading" || phase === "prompting"
            ? "bg-white/5 border border-white/10 text-gray-400 cursor-wait"
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
          }
        `}
      >
        {phase === "loading" || phase === "prompting"
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <Layers className="h-5 w-5" />
        }
        {phase === "loading"   ? "Preparing…" :
         phase === "prompting" ? "Installing…" :
                                 "Install Shortcut"}
      </button>

      <p className="text-[11px] text-gray-500 text-center leading-relaxed">
        Installs a <strong className="text-gray-400">home screen shortcut</strong> for{" "}
        <strong className="text-gray-400">{app.name}</strong>.
        Nothing is downloaded — the shortcut opens the app directly.
      </p>
    </div>
  );
}
