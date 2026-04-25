"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap, Plus, Home, Grid3X3, DollarSign, LifeBuoy,
  ChevronRight, LogIn, UserPlus, LogOut, LayoutDashboard,
  Bell, Settings, User,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/database.types";

const menuItems = [
  { label: "Home",    href: "/",        icon: Home,       desc: "Back to the main page" },
  { label: "Explore", href: "/apps",    icon: Grid3X3,    desc: "Browse all submitted apps" },
  { label: "Pricing", href: "/pricing", icon: DollarSign, desc: "Plans & pricing" },
  { label: "Support", href: "/support", icon: LifeBuoy,   desc: "Help & documentation" },
];

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const drawerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close drawer on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setDrawerOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setDrawerOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // Load + subscribe to notifications when user is logged in
  useEffect(() => {
    if (!user) { setNotifications([]); setUnreadCount(0); return; }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const supabase = createClient();

    // Initial fetch
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) {
          setNotifications(data as Notification[]);
          setUnreadCount(data.filter((n) => !n.is_read).length);
        }
      });

    // Realtime subscription
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function handleMarkAllRead() {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const userInitial = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? "U";

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0F0F1A]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:shadow-blue-500/40 transition-all group-hover:scale-105">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-extrabold gradient-text tracking-tight">AppNex</span>
            </Link>

            {/* Desktop centre nav */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "text-white bg-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {loading ? (
                <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
              ) : user ? (
                <>
                  {/* Submit */}
                  <Link
                    href="/submit"
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Submit
                  </Link>

                  {/* Notifications bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setNotifOpen((v) => !v)}
                      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                      aria-label="Notifications"
                    >
                      <Bell className="h-4 w-4 text-gray-300" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 top-11 w-80 rounded-2xl border border-white/10 bg-[#12122A] shadow-2xl overflow-hidden animate-slide-down z-50">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                          <span className="text-sm font-semibold text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-gray-500">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`px-4 py-3 border-b border-white/5 last:border-0 ${
                                  !n.is_read ? "bg-blue-500/5" : ""
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {!n.is_read && (
                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                                  )}
                                  <div className={!n.is_read ? "" : "pl-3.5"}>
                                    <p className="text-xs font-semibold text-white">{n.title}</p>
                                    {n.body && (
                                      <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                                    )}
                                    <p className="text-[10px] text-gray-600 mt-1">
                                      {new Date(n.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User avatar menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white hover:shadow-blue-500/30 hover:shadow-md transition-all"
                      aria-label="User menu"
                    >
                      {userInitial}
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-11 w-52 rounded-2xl border border-white/10 bg-[#12122A] shadow-2xl overflow-hidden animate-slide-down z-50">
                        <div className="px-4 py-3 border-b border-white/8">
                          <p className="text-sm font-semibold text-white truncate">{userName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-gray-200 hover:bg-white/8 transition-all"
                          >
                            <LayoutDashboard className="h-4 w-4 text-gray-400" />
                            Dashboard
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-gray-200 hover:bg-white/8 transition-all"
                          >
                            <Settings className="h-4 w-4 text-gray-400" />
                            Settings
                          </Link>
                          <div className="border-t border-white/8 my-1" />
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              className="relative flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all md:hidden"
            >
              <span className={`block h-[2px] w-5 rounded-full bg-gray-300 transition-all duration-300 ${drawerOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-[2px] w-5 rounded-full bg-gray-300 transition-all duration-300 ${drawerOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-[2px] w-5 rounded-full bg-gray-300 transition-all duration-300 ${drawerOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div ref={drawerRef} className="fixed inset-x-0 top-16 z-40 animate-slide-down md:hidden">
          <div className="mx-3 mt-1 rounded-2xl border border-white/8 bg-[#12122A]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">

            {/* User info (if logged in) */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white flex-shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="p-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/20"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-white/5 group-hover:bg-white/10"} transition-all`}>
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-200"}`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </Link>
                );
              })}
            </div>

            <div className="mx-4 border-t border-white/5" />

            {/* Auth section */}
            <div className="p-3 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/submit"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white w-full"
                  >
                    <Plus className="h-4 w-4" />
                    Submit an App
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Link
                      href="/login"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all"
                    >
                      <LogIn className="h-4 w-4" />
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign up
                    </Link>
                  </div>
                  <Link
                    href="/submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Submit an App
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}
