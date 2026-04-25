"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, Smartphone } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop" | null;

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed as PWA — don't show
    if (isStandalone()) return;

    // Already dismissed this session
    if (sessionStorage.getItem("pwa-dismissed")) return;

    const plt = detectPlatform();
    setPlatform(plt);

    // Android/Desktop: wait for beforeinstallprompt
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 2s
      setTimeout(() => setShow(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);

    // iOS: show manual hint after 3s (no native prompt on iOS)
    if (plt === "ios") {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  async function handleInstall() {
    if (platform === "ios") {
      // Can't trigger programmatically on iOS — banner already shows instructions
      return;
    }

    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setShow(false);
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }

  function dismiss() {
    setShow(false);
    sessionStorage.setItem("pwa-dismissed", "1");
  }

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm animate-slide-up">
      <div className="bg-[#12122A] border border-blue-500/30 sm:rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* App icon */}
            <div className="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg ring-2 ring-white/10">
              <Image
                src="/icons/icon-96.png"
                alt="AppNex"
                width={52}
                height={52}
                className="rounded-2xl"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">Install AppNex</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                {platform === "ios"
                  ? "Add to your home screen for the full app experience"
                  : "Install for faster access, offline support & home screen shortcut"}
              </p>
            </div>

            <button
              onClick={dismiss}
              className="flex-shrink-0 p-1 text-gray-600 hover:text-gray-300 transition-colors rounded-lg hover:bg-white/5"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action area */}
          {platform === "ios" ? (
            /* iOS: manual instructions */
            <div className="mt-3 rounded-xl bg-white/5 border border-white/8 p-3">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Share className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span>Tap <strong className="text-white">Share</strong></span>
                <span className="text-gray-600">→</span>
                <span>then <strong className="text-white">Add to Home Screen</strong></span>
              </div>
            </div>
          ) : (
            /* Android / Desktop: native install button */
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstall}
                disabled={installing || !deferredPrompt}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {installing ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {installing ? "Installing…" : "Install App"}
              </button>
              <button
                onClick={dismiss}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                Later
              </button>
            </div>
          )}

          {/* Feature pills */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {["Works offline", "Home screen icon", "Fast & lightweight"].map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/8 px-2 py-0.5 text-[10px] text-gray-500">
                <Smartphone className="h-2.5 w-2.5" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
