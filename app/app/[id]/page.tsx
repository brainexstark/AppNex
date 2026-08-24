import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import AppIcon from "@/components/AppIcon";
import BoxInstallButton from "@/components/BoxInstallButton";
import StandaloneRedirect from "@/components/StandaloneRedirect";
import type { App } from "@/lib/types";
import {
  Globe, Smartphone, Package, ArrowLeft,
  ExternalLink, Star, TrendingUp, Eye,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

async function getApp(id: string): Promise<App | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("apps").select("*").eq("id", id).single();
    return data as App | null;
  } catch { return null; }
}

async function getReviews(appId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reviews").select("*, profiles(full_name)")
      .eq("app_id", appId).order("created_at", { ascending: false }).limit(10);
    return data ?? [];
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const app = await getApp(id);
  if (!app) return { title: "Box not found — AppNex" };
  return {
    title: `${app.name} — Install on AppNex`,
    description: app.description || `Install ${app.name} as a home screen shortcut`,
    // This is what makes the /app/[id] page an installable PWA
    manifest: `/api/box/${id}/manifest`,
    other: { "theme-color": String((app as {theme_color?: string}).theme_color ?? "#3B82F6") },
  };
}

const typeConfig = {
  pwa:   { label: "Web App (PWA)", icon: Smartphone, color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20" },
  apk:   { label: "Android APK",  icon: Package,    color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20" },
  web:   { label: "Web App",      icon: Globe,      color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  store: { label: "Native App",   icon: Smartphone, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
};

function resolveAppIcon(app: App): string | null {
  if (app.icon?.startsWith("http")) return app.icon;
  try {
    const hostname = new URL(app.url).hostname.replace(/^www\./, "");
    if (!hostname) return null;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`;
  } catch {
    return null;
  }
}

export default async function AppPage({ params }: Props) {
  const { id } = await params;
  const [app, reviews] = await Promise.all([getApp(id), getReviews(id)]);
  if (!app) notFound();

  const type = typeConfig[app.type] ?? typeConfig.web;
  const TypeIcon = type.icon;
  const ext = app as unknown as Record<string, unknown>;
  const installCount = (ext.install_count as number) ?? 0;
  const resolvedIcon = resolveAppIcon(app);

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/*
        These <link> tags in the page body are picked up by Next.js
        and placed in <head> — making this page an installable PWA.
        The browser will automatically show the install banner / prompt
        just like it does for AppNex itself.
      */}
      <link rel="manifest" href={`/api/box/${id}/manifest`} />
      <meta name="theme-color" content={String(ext.theme_color || "#3B82F6")} />
      {resolvedIcon && (
        <>
          <link rel="apple-touch-icon" href={resolvedIcon} />
          <link rel="icon" href={resolvedIcon} />
          <link rel="shortcut icon" href={resolvedIcon} />
        </>
      )}

      {/*
        When this page is launched from the installed PWA box on the
        home screen, display-mode: standalone matches — immediately
        redirect the user to the real external app URL so the "box"
        behaves like a launcher for the actual app/website.
      */}
      <StandaloneRedirect to={app.url} />

      <Navbar />

      <main className="mx-auto max-w-xl px-4 sm:px-6 py-8">
        <Link href="/apps" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to boxes
        </Link>

        {/* App card */}
        <div className="rounded-2xl border border-white/8 bg-[#1A1A2E] overflow-hidden shadow-xl mb-4">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <div className="p-6">

            {/* Identity */}
            <div className="flex items-start gap-5 mb-5">
              <AppIcon src={app.icon} name={app.name} size={80} className="flex-shrink-0 shadow-lg ring-2 ring-white/8" />
              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-xl font-bold text-white leading-tight mb-2">{app.name}</h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${type.color} ${type.bg}`}>
                  <TypeIcon className="h-3 w-3" />{type.label}
                </span>
                <a href={app.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-blue-400 transition-colors truncate">
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{app.url}</span>
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: TrendingUp, label: "Installs", value: installCount.toLocaleString(), color: "text-green-400" },
                { icon: Star,       label: "Reviews",  value: reviews.length.toString(),     color: "text-yellow-400" },
                { icon: Eye,        label: "Views",    value: String((ext.view_count as number) ?? 0), color: "text-blue-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl bg-white/3 border border-white/5 p-2.5 text-center">
                  <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                  <p className="text-sm font-bold text-white">{value}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {app.description && (
              <p className="text-sm text-gray-400 leading-relaxed mb-5">{app.description}</p>
            )}

            {/*
              BoxInstallButton:
              - Registers /api/box/[id]/sw as the service worker for this page
              - The manifest is already in <head> via generateMetadata
              - Together they satisfy browser PWA installability criteria
              - Browser auto-fires beforeinstallprompt → install banner appears
              - BoxInstallButton captures and triggers that prompt on click
            */}
            <BoxInstallButton app={app} />

            <p className="text-[11px] text-gray-600 mt-3 text-center">
              Added {new Date(app.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-5">
            <h2 className="text-sm font-bold text-white mb-4">Reviews ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.map((review) => {
                const r = review as Record<string, unknown>;
                const profile = r.profiles as Record<string, string> | null;
                const rating = typeof r.rating === "number" ? r.rating : 0;
                return (
                  <div key={String(r.id)} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                      {(profile?.full_name || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-white">{profile?.full_name || "Anonymous"}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => <Star key={s} className={`h-2.5 w-2.5 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />)}
                        </div>
                      </div>
                      {typeof r.body === "string" && r.body && (
                        <p className="text-xs text-gray-400">{r.body}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
