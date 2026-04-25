import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import AppIcon from "@/components/AppIcon";
import InstallButton from "@/components/InstallButton";

export const dynamic = "force-dynamic";
import type { App } from "@/lib/types";
import {
  Globe, Smartphone, Package, ArrowLeft,
  Calendar, ExternalLink, Star, TrendingUp, Eye,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

async function getApp(id: string): Promise<App | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as App;
  } catch {
    return null;
  }
}

async function getReviews(appId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles(full_name, avatar_url)")
      .eq("app_id", appId)
      .order("created_at", { ascending: false })
      .limit(10);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const app = await getApp(id);
  if (!app) return { title: "App not found — AppNex" };
  return {
    title: `${app.name} — AppNex`,
    description: app.description || `Install ${app.name} via AppNex`,
    openGraph: {
      title: app.name,
      description: app.description,
      images: app.icon ? [{ url: app.icon }] : [],
    },
  };
}

const typeConfig = {
  pwa: {
    label: "Progressive Web App",
    icon: Smartphone,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    desc: "Installable directly from your browser",
  },
  apk: {
    label: "Android APK",
    icon: Package,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    desc: "Download and install on Android",
  },
  web: {
    label: "Web App",
    icon: Globe,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    desc: "Opens in your browser",
  },
};

export default async function AppPage({ params }: Props) {
  const { id } = await params;
  const [app, reviews] = await Promise.all([getApp(id), getReviews(id)]);

  if (!app) notFound();

  const type = typeConfig[app.type] ?? typeConfig.web;
  const TypeIcon = type.icon;

  // The App type from lib/types.ts is minimal — cast to access extra DB fields
  const appExt = app as unknown as Record<string, unknown>;
  const installCount = (appExt.install_count as number) ?? 0;
  const viewCount = (appExt.view_count as number) ?? 0;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r as Record<string, number>).rating, 0) / reviews.length).toFixed(1)
    : null;

  const formattedDate = new Date(app.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <Link
          href="/apps"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to all apps
        </Link>

        {/* Main card */}
        <div className="rounded-3xl border border-[#2A2A4A] bg-[#1A1A2E] overflow-hidden shadow-2xl mb-6">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

          <div className="p-8">
            {/* Header */}
            <div className="flex items-start gap-6 mb-6">
              <AppIcon
                src={app.icon}
                name={app.name}
                size={96}
                className="flex-shrink-0 shadow-xl ring-2 ring-white/5"
              />
              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-2xl font-bold text-white leading-tight mb-2">
                  {app.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${type.color} ${type.bg}`}>
                    <TypeIcon className="h-3 w-3" />
                    {type.label}
                  </span>
                  {avgRating && (
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
                      <Star className="h-3 w-3 fill-yellow-400" />
                      {avgRating} ({reviews.length})
                    </span>
                  )}
                </div>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors truncate max-w-full"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{app.url}</span>
                </a>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: TrendingUp, label: "Installs", value: installCount.toLocaleString(), color: "text-green-400" },
                { icon: Eye, label: "Views", value: viewCount.toLocaleString(), color: "text-blue-400" },
                { icon: Star, label: "Reviews", value: reviews.length.toString(), color: "text-yellow-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl bg-white/3 border border-white/5 p-3 text-center">
                  <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                  <p className="text-sm font-bold text-white">{value}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {app.description && (
              <div className="mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">About</h2>
                <p className="text-sm text-gray-300 leading-relaxed">{app.description}</p>
              </div>
            )}

            {/* Install section */}
            <div className="rounded-2xl border border-[#2A2A4A] bg-[#0F0F1A] p-5 mb-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">Ready to install</p>
                  <p className="text-xs text-gray-500">{type.desc}</p>
                </div>
                <InstallButton app={app} size="lg" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="h-3.5 w-3.5" />
              Added {formattedDate}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="rounded-3xl border border-[#2A2A4A] bg-[#1A1A2E] p-6">
            <h2 className="text-base font-bold text-white mb-4">
              Reviews
              <span className="ml-2 text-sm font-normal text-gray-500">({reviews.length})</span>
            </h2>
            <div className="space-y-4">
              {reviews.map((review) => {
                const r = review as Record<string, unknown>;
                const profile = r.profiles as Record<string, string> | null;
                const initial = (profile?.full_name || "A")[0].toUpperCase();
                const reviewBody = typeof r.body === "string" ? r.body : null;
                const reviewRating = typeof r.rating === "number" ? r.rating : 0;
                const reviewId = String(r.id ?? Math.random());
                return (
                  <div key={reviewId} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white">
                          {profile?.full_name || "Anonymous"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-2.5 w-2.5 ${
                                s <= reviewRating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {reviewBody && (
                        <p className="text-xs text-gray-400 leading-relaxed">{reviewBody}</p>
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
