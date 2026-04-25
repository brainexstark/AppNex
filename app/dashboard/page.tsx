import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AppRowCard from "@/components/AppRowCard";
import Link from "next/link";
import {
  Plus, Package, TrendingUp, Star, Bell,
  Settings, ArrowRight, Zap,
} from "lucide-react";
import type { App } from "@/lib/types";
import type { Notification } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Auth guard — server-side
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // Fetch user's apps
  const { data: apps } = await supabase
    .from("apps")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, plan, app_count")
    .eq("id", user.id)
    .single();

  const profile = profileData as { full_name: string | null; plan: string; app_count: number } | null;

  // Fetch recent notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const myApps = (apps ?? []) as App[];
  const myNotifs = (notifications ?? []) as Notification[];
  const totalInstalls = myApps.reduce((sum, a) => sum + ((a as any).install_count ?? 0), 0);
  const unreadCount = myNotifs.filter((n) => !n.is_read).length;

  const userName = profile?.full_name || user.email?.split("@")[0] || "Developer";
  const userInitial = userName[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-extrabold text-white shadow-lg">
              {userInitial}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Welcome back, {userName.split(" ")[0]}!
              </h1>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Submit App
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Package,
              label: "My Apps",
              value: myApps.length,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              icon: TrendingUp,
              label: "Total Installs",
              value: totalInstalls.toLocaleString(),
              color: "text-green-400",
              bg: "bg-green-400/10",
            },
            {
              icon: Star,
              label: "Plan",
              value: profile?.plan ?? "free",
              color: "text-yellow-400",
              bg: "bg-yellow-400/10",
              capitalize: true,
            },
            {
              icon: Bell,
              label: "Notifications",
              value: unreadCount > 0 ? `${unreadCount} new` : "All read",
              color: "text-purple-400",
              bg: "bg-purple-400/10",
            },
          ].map(({ icon: Icon, label, value, color, bg, capitalize }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-5"
            >
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className={`text-xl font-extrabold text-white ${capitalize ? "capitalize" : ""}`}>
                {value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* My Apps */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">My Apps</h2>
              <Link
                href="/submit"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add new
              </Link>
            </div>

            {myApps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#1A1A2E] p-10 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                  <Zap className="h-7 w-7 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">No apps yet</p>
                <p className="text-xs text-gray-500 mb-4">
                  Submit your first app — it takes less than 30 seconds.
                </p>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Submit App
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {myApps.map((app) => (
                  <AppRowCard key={app.id} app={app} />
                ))}
                {myApps.length >= 20 && (
                  <Link
                    href="/apps"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-[#1A1A2E] py-3 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    View all apps <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#1A1A2E] overflow-hidden">
              {myNotifs.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No notifications yet
                </div>
              ) : (
                myNotifs.map((n, i) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3.5 ${i < myNotifs.length - 1 ? "border-b border-white/5" : ""} ${!n.is_read ? "bg-blue-500/5" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && (
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                      )}
                      <div className={!n.is_read ? "" : "pl-3.5"}>
                        <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                        {n.body && (
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                        )}
                        <p className="text-[10px] text-gray-600 mt-1">
                          {new Date(n.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
