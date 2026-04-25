"use client";

import { useState } from "react";
import AppRowCard from "./AppRowCard";
import type { App, AppType } from "@/lib/types";
import { Search, SlidersHorizontal } from "lucide-react";

interface AppsGridProps {
  apps: App[];
}

type FilterType = "all" | AppType;

const filterTabs: { label: string; value: FilterType; color: string }[] = [
  { label: "All", value: "all", color: "from-blue-500 to-purple-600" },
  { label: "PWA", value: "pwa", color: "from-blue-500 to-blue-600" },
  { label: "APK", value: "apk", color: "from-green-500 to-green-600" },
  { label: "Web", value: "web", color: "from-purple-500 to-purple-600" },
];

export default function AppsGrid({ apps }: AppsGridProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const filtered = apps.filter((app) => {
    const matchesType = filter === "all" || app.type === filter;
    const matchesSearch =
      !search ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group into sections like Play Store: "New" (first 3), then "All Apps"
  const newApps = filtered.slice(0, 3);
  const remainingApps = filtered.slice(3);

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
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

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 bg-[#1A1A2E] border border-[#2A2A4A] rounded-xl p-1">
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
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-sm">No apps match your search.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* "New & Updated" section — first 3 */}
          {newApps.length > 0 && (
            <section>
              <SectionHeader
                title="New & Updated"
                subtitle="Recently submitted apps"
                count={newApps.length}
                showCount={false}
              />
              <div className="space-y-2">
                {newApps.map((app, i) => (
                  <AppRowCard key={app.id} app={app} rank={i + 1} showRank />
                ))}
              </div>
            </section>
          )}

          {/* Remaining apps */}
          {remainingApps.length > 0 && (
            <section>
              <SectionHeader
                title="All Apps"
                subtitle={`${filtered.length} apps total`}
                count={remainingApps.length}
                showCount
              />
              <div className="space-y-2">
                {remainingApps.map((app) => (
                  <AppRowCard key={app.id} app={app} />
                ))}
              </div>
            </section>
          )}

          {/* If all apps fit in "new" section */}
          {remainingApps.length === 0 && newApps.length > 0 && filtered.length <= 3 && (
            <p className="text-center text-xs text-gray-600 pt-4">
              Showing all {filtered.length} app{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  count,
  showCount,
}: {
  title: string;
  subtitle: string;
  count: number;
  showCount: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      {showCount && (
        <span className="text-xs text-gray-500">{count} apps</span>
      )}
    </div>
  );
}
