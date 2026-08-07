"use client";

import { useState, useEffect, useCallback } from "react";
import AppBox from "./AppBox";
import type { App, AppType } from "@/lib/types";
import { Search, Plus, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";

interface AppsGridProps {
  initialApps: App[];
}

type FilterType = "all" | AppType;

const filterTabs: { label: string; value: FilterType; emoji: string; color: string }[] = [
  { label: "All",    value: "all",   emoji: "✦", color: "from-blue-500 to-purple-600" },
  { label: "PWA",    value: "pwa",   emoji: "⚡", color: "from-blue-500 to-blue-600" },
  { label: "APK",    value: "apk",   emoji: "📦", color: "from-green-500 to-green-600" },
  { label: "Web",    value: "web",   emoji: "🌐", color: "from-purple-500 to-purple-600" },
  { label: "Native", value: "store", emoji: "📱", color: "from-orange-500 to-red-600" },
];

export default function AppsGrid({ initialApps }: AppsGridProps) {
  const [apps, setApps] = useState<App[]>(initialApps);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/apps?limit=1000");
      if (res.ok) setApps(await res.json());
    } catch { /* silent */ }
    finally { setRefreshing(false); }
  }, []);

  // Realtime updates
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    let cleanup: (() => void) | undefined;
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      const ch = supabase.channel("apps-rt")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "apps" }, (p) => {
          const a = p.new as App;
          setApps((prev) => prev.some((x) => x.id === a.id) ? prev : [a, ...prev]);
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "apps" }, (p) => {
          setApps((prev) => prev.filter((x) => x.id !== (p.old as { id: string }).id));
        })
        .subscribe();
      cleanup = () => supabase.removeChannel(ch);
    });
    return () => cleanup?.();
  }, []);

  useEffect(() => { setApps(initialApps); }, [initialApps]);

  const filtered = apps.filter((app) => {
    if (filter !== "all" && app.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return app.name.toLowerCase().includes(q) || (app.description ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  // Split into featured (first 4) and rest
  const featured = filtered.slice(0, 4);
  const rest = filtered.slice(4);

  return (
    <div>
      {/* Search + filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search app boxes…"
            className="w-full rounded-2xl bg-[#1A1A2E] border border-white/8 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1A1A2E] border border-white/8 rounded-2xl p-1.5">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === tab.value
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-sm scale-105`
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <button onClick={refresh} disabled={refreshing} title="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-[#1A1A2E] text-gray-400 hover:text-white hover:border-blue-500/40 transition-all disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
            <Layers className="h-10 w-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No app boxes yet</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-6">
            {search ? `No results for "${search}"` : "Be the first to submit an app box."}
          </p>
          {!search && (
            <Link href="/submit" className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105">
              <Plus className="h-4 w-4" />Create First Box
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── Featured boxes — 2×2 large grid ── */}
          {featured.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-yellow-400">✦</span>
                    {filter === "all" && !search ? "Featured Boxes" : "Results"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {filtered.length} box{filtered.length !== 1 ? "es" : ""} available
                  </p>
                </div>
                <Link href="/submit" className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:shadow-blue-500/20 hover:shadow-md transition-all">
                  <Plus className="h-3.5 w-3.5" />Add Box
                </Link>
              </div>
              {/* 2-column on mobile, 4-column on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featured.map((app) => (
                  <AppBox key={app.id} app={app} featured />
                ))}
              </div>
            </section>
          )}

          {/* ── All remaining boxes ── */}
          {rest.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-gray-500">◈</span> All App Boxes
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {rest.map((app) => (
                  <AppBox key={app.id} app={app} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
