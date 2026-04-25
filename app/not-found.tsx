import Link from "next/link";
import { Zap } from "lucide-react";

// Static 404 — no Supabase, no auth context needed
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Minimal static navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0F0F1A]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-extrabold gradient-text tracking-tight">AppNex</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        {/* Glow orb */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
          <Zap className="h-10 w-10 text-blue-400" />
        </div>
        <h1 className="text-6xl font-extrabold gradient-text mb-4">404</h1>
        <h2 className="text-xl font-bold text-white mb-3">Page not found</h2>
        <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
          >
            Back to AppNex
          </Link>
          <Link
            href="/apps"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-all"
          >
            Browse Apps
          </Link>
        </div>
      </div>
    </div>
  );
}
