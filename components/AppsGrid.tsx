"use client";

import { useState, useEffect, useCallback } from "react";
import AppRowCard from "./AppRowCard";
import type { App, AppType } from "@/lib/types";
import { Search, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

interface AppsGridProps {
  initialApps: App[];
}

type FilterType = "all" | AppType;

const filterTabs: { label: string; value: FilterType; color: string }[] = [
  { label: "All",  value: "all", color: "from-blue-500 to-purple-600" },
  { label: "PWA",  value: "pwa", color: "from-blue-500 to-blue-600" },
  { label: "APK",  value: "apk", color: "from-green-500 to-green-600" },
  { label: "Web",  value: "web", color: "from-purple-500 to-purple-600" },
];

export default function AppsGrid({ initialApps }: AppsGridProps) {
  const [apps, setApps] = useState<App[]>(initialApps);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Manual refresh — re-fetches all apps from API
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/apps?limit=1000");
      if (res.ok) {
        const data: App[] = await res.json();
        setApps(data);
      }
    } catch {
      // silently fail
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Realtime: subscribe to new app inserts
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    let cleanup: (() => void) | undefined;

    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      const channel = supabase
        .channel("apps-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "apps" },
          (payload) => {
            const newApp = payload.new as App;
            setApps((prev) => {
              if (prev.some((a) => a.id === newApp.id)) return prev;
              return [newApp, ...prev];
            });
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "apps" },
          (payload) => {
            const deleted = payload.old as { id: string };
            setApps((prev) => prev.filter((a) => a.id !== deleted.id));
          }
        )
        .subscribe();

      cleanup = () => { supabase.removeChannel(channel); };
    });

    return () => { cleanup?.(); };
  }, []);

  // Sync when parent re-renders
  useEffect(() => {
    setApps(initialApps);
  }, [initialApps]);

  const filtered = apps.filter((app) => {
    const matchesType = filter === "all" || app.type === filter;
    const matchesSearch =
      !search ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.description ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div>
      {/* Search + filter + refresh */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps…"
            className="w-full rounded-xl bg-[#1A1A2E] border border-[#2A2A4A] pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[#1A1A2E] border border-[#2A2A4A] rounded-xl p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab.value
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-sm`
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A4A] bg-[#1A1A2E] text-gray-400 hover:text-white hover:border-blue-500/40 transition-all disabled:opacity-50"
            aria-label="Refresh apps"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-sm mb-4">
            {search || filter !== "all" ? "No apps match your search." : "No apps yet."}
          </p>
          {!search && filter === "all" && (
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Submit the first app
            </Link>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">
                {filter === "all" && !search ? "All Apps" : "Results"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {filtered.length} app{filtered.length !== 1 ? "s" : ""}
                {filter !== "all" ? ` · ${filter.toUpperCase()}` : ""}
              </p>
            </div>
            <Link
              href="/submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:shadow-blue-500/20 hover:shadow-md transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Submit App
            </Link>
          </div>

          <div className="space-y-2">
            {filtered.map((app, i) => (
              <AppRowCard key={app.id} app={app} rank={i + 1} showRank={i < 3} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
