"use client";

import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
        <WifiOff className="h-10 w-10 text-blue-400" />
      </div>
      <h1 className="text-2xl font-extrabold text-white mb-3">You&apos;re offline</h1>
      <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
        No internet connection. Some pages may still be available from cache.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-all"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
