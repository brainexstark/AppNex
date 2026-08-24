"use client";

import { useEffect } from "react";

interface Props {
  to: string;
}

/**
 * StandaloneRedirect — runs on the box install page (/app/[id]).
 *
 * When the user launches the installed PWA box (from their home screen),
 * it opens this page via the manifest's same-origin start_url.
 * We immediately detect display-mode: standalone (or WCO) and bounce
 * the user to the real external app URL — so the "installed box"
 * experience still opens the actual website/app.
 */
export default function StandaloneRedirect({ to }: Props) {
  useEffect(() => {
    if (typeof window === "undefined" || !to) return;
    let triggered = false;

    const redirect = () => {
      if (triggered) return;
      triggered = true;
      try {
        window.location.replace(to);
      } catch {
        try {
          window.location.href = to;
        } catch {
          /* ignore */
        }
      }
    };

    try {
      if (window.matchMedia) {
        const standalone = window.matchMedia("(display-mode: standalone)");
        const wco = window.matchMedia("(display-mode: window-controls-overlay)");
        if (standalone.matches || wco.matches) {
          redirect();
          return;
        }
        // Also listen for transitions (e.g. Chrome for Android fires appinstalled
        // before the display-mode media switches — race, so we wait a tick)
        const onChange = () => {
          if (standalone.matches || wco.matches) redirect();
        };
        if (standalone.addEventListener) standalone.addEventListener("change", onChange);
        else if (standalone.addListener) standalone.addListener(onChange);
        if (wco.addEventListener) wco.addEventListener("change", onChange);
        else if (wco.addListener) wco.addListener(onChange);
        // Fallback: some browsers change display-mode within a frame after install
        const t = window.setTimeout(() => {
          try {
            const s = window.matchMedia("(display-mode: standalone)").matches;
            const w = window.matchMedia("(display-mode: window-controls-overlay)").matches;
            if (s || w) redirect();
          } catch { /* ignore */ }
        }, 300);
        return () => {
          try {
            if (standalone.removeEventListener) standalone.removeEventListener("change", onChange);
            else if (standalone.removeListener) standalone.removeListener(onChange);
            if (wco.removeEventListener) wco.removeEventListener("change", onChange);
            else if (wco.removeListener) wco.removeListener(onChange);
          } catch { /* ignore */ }
          try { clearTimeout(t); } catch { /* ignore */ }
        };
      }
    } catch {
      return undefined;
    }
    return undefined;
  }, [to]);

  return null;
}
