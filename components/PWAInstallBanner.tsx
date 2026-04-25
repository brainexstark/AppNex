"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    // Don't show if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setShow(false);
  }

  function handleDismiss() {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  }

  if (!show || dismissed || installed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-slide-up">
      <div className="glass rounded-2xl border border-blue-500/30 p-4 shadow-2xl shadow-blue-500/10">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="AppNex" className="h-8 w-8 rounded-lg" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Install AppNex</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Add to your home screen for the best experience
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:shadow-blue-500/30 hover:shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* iOS hint */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
          <Smartphone className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
          <p className="text-[10px] text-gray-600">
            On iPhone: tap <span className="text-gray-400">Share</span> → <span className="text-gray-400">Add to Home Screen</span>
          </p>
        </div>
      </div>
    </div>
  );
}
