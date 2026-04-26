import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import AppsGrid from "@/components/AppsGrid";
import type { App } from "@/lib/types";
import { Zap, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getApps(): Promise<App[]> {
  try {
    const supabase = await createClient();
    // Fetch up to 1000 apps per page load.
    // AppNex stores only metadata (~1 KB per row) so this is fast.
    // Supabase free tier = 500 MB database = ~500,000 app records possible.
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) return [];
    return (data ?? []) as App[];
  } catch {
    return [];
  }
}

export default async function AppsPage() {
  const apps = await getApps();

  const pwaCount = apps.filter((a) => a.type === "pwa").length;
  const apkCount = apps.filter((a) => a.type === "apk").length;
  const webCount = apps.filter((a) => a.type === "web").length;

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />

      <div className="border-b border-[#2A2A4A] bg-[#0F0F1A]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">All Apps</h1>
              <p className="mt-1 text-sm text-gray-400">
                {apps.length.toLocaleString()} app{apps.length !== 1 ? "s" : ""} available to install
              </p>
            </div>
            <Link
              href="/submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Submit App
            </Link>
          </div>

          {apps.length > 0 && (
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {[
                { label: "All", count: apps.length },
                { label: "PWA", count: pwaCount },
                { label: "APK", count: apkCount },
                { label: "Web", count: webCount },
              ].map((tab) => (
                <span
                  key={tab.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#2A2A4A] bg-[#1A1A2E] px-3 py-1 text-xs font-medium text-gray-300"
                >
                  {tab.label}
                  <span className="rounded-full bg-[#2A2A4A] px-1.5 py-0.5 text-[10px] text-gray-400">
                    {tab.count.toLocaleString()}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {apps.length === 0 ? <EmptyState /> : <AppsGrid initialApps={apps} />}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
        <Zap className="h-10 w-10 text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">No apps yet</h2>
      <p className="text-gray-400 max-w-sm mb-8">
        Be the first to submit an app. Paste any URL and AppNex will automatically extract the details.
      </p>
      <Link
        href="/submit"
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Submit First App
      </Link>
    </div>
  );
}
