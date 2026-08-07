"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import UrlInput from "@/components/UrlInput";
import PreviewCard from "@/components/PreviewCard";
import type { AppMetadata } from "@/lib/types";
import { Layers, Globe, Smartphone, Package, Zap } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function SubmitPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [preview, setPreview] = useState<{ url: string; data: AppMetadata } | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/submit");
  }, [user, loading, router]);

  const handlePreview = useCallback((url: string, data: AppMetadata) => {
    setPreview({ url, data });
  }, []);

  const handleClear = useCallback(() => setPreview(null), []);

  async function handleSubmit(name: string, description: string) {
    if (!preview) return;
    const ext = preview.data as AppMetadata & {
      store_android?: string | null;
      store_ios?: string | null;
      store_windows?: string | null;
    };
    const res = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, description,
        type: preview.data.type,
        url: preview.url,
        icon: preview.data.icon,
        theme_color: preview.data.theme_color,
        store_android: ext.store_android ?? null,
        store_ios: ext.store_ios ?? null,
        store_windows: ext.store_windows ?? null,
      }),
    });
    if (res.ok || res.status === 409) {
      setTimeout(() => { router.push("/apps"); router.refresh(); }, 1000);
    }
  }

  if (loading || !user) return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
      <span className="h-8 w-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
            <Layers className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Create an App Box</h1>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Paste any app or website URL. AppNex wraps it in an installable box —
            users install the <strong className="text-white">box</strong>, not the app files.
            The box opens the real app when launched.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-4 gap-3 mb-10">
          {[
            { icon: Globe, label: "Paste URL", desc: "Any website or app" },
            { icon: Zap, label: "Auto-detect", desc: "PWA, APK, Web, Native" },
            { icon: Layers, label: "Creates a box", desc: "Stores app identity" },
            { icon: Smartphone, label: "Users install", desc: "Box opens the app" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-3 text-center">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                <Icon className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-xs font-bold text-white">{label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* URL input */}
        <UrlInput onPreview={handlePreview} onClear={handleClear} />

        {/* Preview */}
        {preview && (
          <div className="mt-8">
            <PreviewCard url={preview.url} data={preview.data} onSubmit={handleSubmit} />
          </div>
        )}

        {/* Supported formats */}
        {!preview && (
          <div className="mt-10 rounded-2xl border border-white/8 bg-[#1A1A2E] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Supported Box Formats
            </p>
            <div className="space-y-3">
              {[
                { icon: Smartphone, color: "text-blue-400", bg: "bg-blue-400/10", title: "Progressive Web App (PWA)", desc: "Sites with /manifest.json — installed natively via browser prompt" },
                { icon: Package,    color: "text-green-400", bg: "bg-green-400/10", title: "Android APK",          desc: "Direct .apk links — box triggers the download" },
                { icon: Smartphone, color: "text-orange-400", bg: "bg-orange-400/10", title: "Native App (Store)", desc: "TikTok, Instagram etc. — box redirects to correct app store" },
                { icon: Globe,      color: "text-purple-400", bg: "bg-purple-400/10", title: "Web Application",    desc: "Any website — box opens it and prompts Add to Home Screen" },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
