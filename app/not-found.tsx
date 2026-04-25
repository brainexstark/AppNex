import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
          <Zap className="h-10 w-10 text-blue-400" />
        </div>
        <h1 className="text-5xl font-extrabold gradient-text mb-4">404</h1>
        <h2 className="text-xl font-bold text-white mb-3">Page not found</h2>
        <p className="text-gray-400 max-w-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
        >
          Back to AppNex
        </Link>
      </div>
    </div>
  );
}
