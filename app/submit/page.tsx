"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import UrlInput from "@/components/UrlInput";
import PreviewCard from "@/components/PreviewCard";
import type { AppMetadata } from "@/lib/types";
import { Zap, Globe, Smartphone, Package } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function SubmitPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [preview, setPreview] = useState<{ url: string; data: AppMetadata } | null>(null);

  // Redirect to login if not authenticated (client-side backup)
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/submit");
    }
  }, [user, loading, router]);

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

    if (res.ok) {
      setTimeout(() => {
        router.push("/apps");
      }, 1200);
    } else if (res.status === 409) {
      // Already exists — still go to the listing
      setTimeout(() => router.push("/apps"), 800);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Submit an App</h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Paste your app URL and AppNex will automatically detect the type and
            extract metadata. Review the preview, then submit.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: Globe, label: "Paste URL", desc: "Any http/https link" },
            { icon: Zap, label: "Auto-detect", desc: "PWA, APK, or Web" },
            { icon: Smartphone, label: "Instant listing", desc: "Icon + install button" },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-[#2A2A4A] bg-[#1A1A2E] p-4 text-center"
            >
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                <Icon className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-xs font-semibold text-white">{label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <UrlInput onPreview={handlePreview} onClear={handleClear} />

        {/* Preview */}
        {preview && (
          <div className="mt-8">
            <PreviewCard
              url={preview.url}
              data={preview.data}
              onSubmit={handleSubmit}
            />
          </div>
        )}

        {/* Supported types */}
        {!preview && (
          <div className="mt-10 rounded-2xl border border-[#2A2A4A] bg-[#1A1A2E] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Supported App Types
            </p>
            <div className="space-y-3">
              {[
                {
                  icon: Smartphone,
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                  title: "Progressive Web Apps (PWA)",
                  desc: "URLs with a /manifest.json — installable directly from the browser",
                },
                {
                  icon: Package,
                  color: "text-green-400",
                  bg: "bg-green-400/10",
                  title: "Android APKs",
                  desc: "Direct .apk download links — users download and sideload",
                },
                {
                  icon: Globe,
                  color: "text-purple-400",
                  bg: "bg-purple-400/10",
                  title: "Web Apps",
                  desc: "Any web URL — opens in browser with Add to Home Screen hint",
                },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{title}</p>
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
