"use client";

import { useState, useEffect } from "react";
import { Download, ExternalLink, Smartphone, CheckCircle } from "lucide-react";
import type { App } from "@/lib/types";

interface InstallButtonProps {
  app: App;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Global deferred prompt store (per PWA URL)
const deferredPrompts: Map<string, BeforeInstallPromptEvent> = new Map();

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButton({ app, size = "md", className = "" }: InstallButtonProps) {
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [hint, setHint] = useState(false);
  const [canInstallPWA, setCanInstallPWA] = useState(false);

  useEffect(() => {
    if (app.type !== "pwa") return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompts.set(app.url, e as BeforeInstallPromptEvent);
      setCanInstallPWA(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    // Check if already stored
    if (deferredPrompts.has(app.url)) {
      setCanInstallPWA(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [app.url, app.type]);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const iconSize = { sm: 14, md: 16, lg: 18 }[size];

  async function handleInstall() {
    if (installed) return;

    if (app.type === "pwa") {
      const deferred = deferredPrompts.get(app.url);
      if (deferred) {
        setInstalling(true);
        try {
          await deferred.prompt();
          const { outcome } = await deferred.userChoice;
          if (outcome === "accepted") {
            setInstalled(true);
            deferredPrompts.delete(app.url);
          }
        } finally {
          setInstalling(false);
        }
      } else {
        // Open the PWA and show hint
        window.open(app.url, "_blank", "noopener,noreferrer");
        setHint(true);
        setTimeout(() => setHint(false), 5000);
      }
      return;
    }

    if (app.type === "apk") {
      window.location.href = app.url;
      return;
    }

    // Web app
    window.open(app.url, "_blank", "noopener,noreferrer");
    setHint(true);
    setTimeout(() => setHint(false), 5000);
  }

  const buttonLabel = () => {
    if (installed) return "Installed";
    if (installing) return "Installing…";
    if (app.type === "apk") return "Download APK";
    if (app.type === "pwa") return canInstallPWA ? "Install App" : "Open App";
    return "Open App";
  };

  const ButtonIcon = () => {
    if (installed) return <CheckCircle size={iconSize} />;
    if (app.type === "apk") return <Download size={iconSize} />;
    if (app.type === "pwa" && canInstallPWA) return <Smartphone size={iconSize} />;
    return <ExternalLink size={iconSize} />;
  };

  return (
    <div className="relative">
      <button
        onClick={handleInstall}
        disabled={installed || installing}
        aria-label={`${buttonLabel()} ${app.name}`}
        className={`
          inline-flex items-center justify-center font-semibold rounded-xl
          transition-all duration-200 select-none
          ${sizeClasses[size]}
          ${
            installed
              ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
              : installing
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-wait"
              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
          }
          ${className}
        `}
      >
        <ButtonIcon />
        {buttonLabel()}
      </button>

      {/* Add to Home Screen hint */}
      {hint && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 rounded-xl bg-[#1A1A2E] border border-[#2A2A4A] p-3 text-xs text-gray-300 shadow-xl z-10 animate-fade-in text-center">
          <p className="font-medium text-white mb-1">Add to Home Screen</p>
          <p>Tap the share icon and select "Add to Home Screen" to install.</p>
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1A1A2E] border-r border-b border-[#2A2A4A] rotate-45" />
        </div>
      )}
    </div>
  );
}
