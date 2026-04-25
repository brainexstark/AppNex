"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import UrlInput from "./UrlInput";
import PreviewCard from "./PreviewCard";
import type { AppMetadata } from "@/lib/types";
import { Zap, Rocket, Shield, Globe, Smartphone, ArrowRight } from "lucide-react";
import Link from "next/link";

const MOTIVATIONS = [
  "Turn any URL into an installable app — instantly.",
  "Your app store. Your rules. Zero gatekeeping.",
  "PWA, APK, or Web — one platform for all.",
  "Paste a link. Get a listing. Ship faster.",
  "The smartest way to distribute your app.",
];

const STATS = [
  { value: "10s", label: "Average setup time" },
  { value: "3", label: "App types supported" },
  { value: "100%", label: "Free to submit" },
];

export default function HomeHero() {
  const router = useRouter();
  const [preview, setPreview] = useState<{ url: string; data: AppMetadata } | null>(null);
  const [motIdx, setMotIdx] = useState(0);
  const [fade, setFade] = useState(true);

  // Cycle motivational text
  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMotIdx((i) => (i + 1) % MOTIVATIONS.length);
        setFade(true);
      }, 400);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const handlePreview = useCallback((url: string, data: AppMetadata) => {
    setPreview({ url, data });
  }, []);

  const handleClear = useCallback(() => {
    setPreview(null);
  }, []);

  async function handleSubmit(name: string, description: string) {
    if (!preview) return;
    const res = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        type: preview.data.type,
        url: preview.url,
        icon: preview.data.icon,
        theme_color: preview.data.theme_color,
      }),
    });
    if (res.ok || res.status === 409) {
      setTimeout(() => { router.push("/apps"); router.refresh(); }, 1200);
    }
  }

  return (
    <section className="relative overflow-hidden hero-bg">
      {/* ── Animated floating orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb-a absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="orb-b absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[100px]" />
        <div className="orb-c absolute -bottom-20 left-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-24 sm:py-32 text-center">

        {/* Live badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 pulse-ring" />
          Now live — submit your app in seconds
        </div>

        {/* Headline */}
        <h1 className="mb-5 text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
          <span className="text-white">One platform.</span>
          <br />
          <span className="gradient-text">Every app.</span>
        </h1>

        {/* Rotating motivational line */}
        <div className="mb-4 h-8 flex items-center justify-center">
          <p
            className="text-lg sm:text-xl font-medium text-blue-200 transition-opacity duration-400"
            style={{ opacity: fade ? 1 : 0 }}
          >
            {MOTIVATIONS[motIdx]}
          </p>
        </div>

        {/* Sub-copy */}
        <p className="mb-10 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          AppNex is the universal app distribution platform. Paste any link — a PWA, an APK, or a
          web app — and we automatically extract the icon, name, and description, then generate a
          clean listing with a working install button. No developer account needed. No review
          process. Just paste and publish.
        </p>

        {/* URL Input */}
        <UrlInput onPreview={handlePreview} onClear={handleClear} />

        {/* CTA row */}
        {!preview && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/apps"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Globe className="h-4 w-4" />
              Explore Apps
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/submit"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-all"
            >
              <Rocket className="h-4 w-4" />
              Submit Your App
            </Link>
          </div>
        )}

        {/* Preview card */}
        {preview && (
          <div className="mt-8">
            <PreviewCard url={preview.url} data={preview.data} onSubmit={handleSubmit} />
          </div>
        )}

        {/* Stats row */}
        {!preview && (
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold gradient-text">{s.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Feature strip ── */}
      {!preview && (
        <div className="relative border-t border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  color: "text-yellow-400",
                  bg: "bg-yellow-400/10",
                  title: "Instant extraction",
                  desc: "We fetch your manifest, meta tags, and favicon automatically — no manual input.",
                },
                {
                  icon: Smartphone,
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                  title: "Universal install",
                  desc: "PWA install prompts, APK downloads, and web app shortcuts — all handled for you.",
                },
                {
                  icon: Shield,
                  color: "text-green-400",
                  bg: "bg-green-400/10",
                  title: "No hosting required",
                  desc: "AppNex only stores links. Your app stays on your server — we just make it discoverable.",
                },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
