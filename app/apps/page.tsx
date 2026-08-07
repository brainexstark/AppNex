import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AppsGrid from "@/components/AppsGrid";
import type { App } from "@/lib/types";
import { Plus, Layers } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getApps(): Promise<App[]> {
  try {
    const supabase = await createClient();
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
  // Auth guard — server-side
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/apps");

  const apps = await getApps();

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />

      {/* Page header */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0F0F1A]">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-96 rounded-full bg-blue-600/8 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
                <Layers className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">App Boxes</h1>
                <p className="mt-0.5 text-sm text-gray-400">
                  {apps.length.toLocaleString()} installable boxes ·{" "}
                  <span className="text-blue-400">tap any box to install</span>
                </p>
              </div>
            </div>
            <Link
              href="/submit"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Submit Box
            </Link>
          </div>

          {/* What is a box — quick explanation */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { icon: "📦", text: "Each box holds an app's identity" },
              { icon: "⚡", text: "Install the box, not the app files" },
              { icon: "📱", text: "Works on any phone or PC" },
              { icon: "🔗", text: "Opens the real app when launched" },
            ].map(({ icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/3 px-3 py-1 text-xs text-gray-400">
                <span>{icon}</span>{text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <AppsGrid initialApps={apps} />
      </main>
    </div>
  );
}
