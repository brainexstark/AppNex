"use client";

/**
 * AppBox — The core AppNex UI primitive.
 * Shows app identity and dispatches installs via the InstallButton
 * component which correctly routes: store → store link, APK → download,
 * PWA/Web → /app/[id] install page.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { App } from "@/lib/types";
import { Globe, Smartphone, Package, Star, TrendingUp } from "lucide-react";
import InstallButton from "./InstallButton";

interface AppBoxProps {
  app: App;
  featured?: boolean;
}

const typeConfig = {
  pwa:   { label: "PWA",    color: "text-blue-400",   bg: "bg-blue-400/15",   border: "border-blue-400/25",   icon: Smartphone },
  apk:   { label: "APK",    color: "text-green-400",  bg: "bg-green-400/15",  border: "border-green-400/25",  icon: Package },
  web:   { label: "Web",    color: "text-purple-400", bg: "bg-purple-400/15", border: "border-purple-400/25", icon: Globe },
  store: { label: "Native", color: "text-orange-400", bg: "bg-orange-400/15", border: "border-orange-400/25", icon: Smartphone },
};

function AppIconFallback({ name, size }: { name: string; size: number }) {
  const colors = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-yellow-500 to-orange-600",
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${colors[idx]} font-bold text-white select-none`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name?.[0]?.toUpperCase() ?? "A"}
    </div>
  );
}

function AppIconImage({ src, name, size }: { src: string; name: string; size: number }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <AppIconFallback name={name} size={size} />;
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={() => setErr(true)}
        unoptimized
      />
    </div>
  );
}

export default function AppBox({ app, featured = false }: AppBoxProps) {
  const type = typeConfig[app.type] ?? typeConfig.web;
  const TypeIcon = type.icon;
  const ext = app as App & { install_count?: number; avg_rating?: number };

  return (
    <div
      className={`
        group relative flex flex-col rounded-3xl overflow-hidden
        border transition-transform duration-200
        md:hover:scale-[1.02] active:scale-[0.985]
        md:transition-all md:duration-300 md:hover:shadow-2xl md:hover:shadow-blue-500/15
        transform-gpu will-change-transform
        ${featured
          ? "border-blue-500/30 bg-gradient-to-br from-[#1A1A35] to-[#0F0F25]"
          : "border-white/8 bg-[#1A1A2E] md:hover:border-white/15"
        }
      `}
      style={{ contain: "layout paint style" }}
    >
      {/* Featured glow — desktop only */}
      {featured && (
        <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 pointer-events-none" />
      )}

      {/* Top colored strip */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${
        app.type === "pwa"   ? "from-blue-500 to-blue-600"   :
        app.type === "apk"   ? "from-green-500 to-green-600" :
        app.type === "store" ? "from-orange-500 to-red-500"  :
                               "from-purple-500 to-purple-600"
      }`} />

      {/* Clickable area — opens app detail page (NOT the install action) */}
      <Link
        href={`/app/${app.id}`}
        className="flex flex-col items-center p-4 sm:p-5 pb-2 sm:pb-3 flex-1 focus:outline-none"
      >
        {/* Large icon — the face of the box */}
        <div className="relative mb-3 sm:mb-4">
          <div className="shadow-md md:shadow-xl ring-2 ring-white/8 rounded-2xl">
            <AppIconImage src={app.icon} name={app.name} size={64} />
          </div>
          {/* Type badge */}
          <span
            className={`absolute -bottom-1.5 -right-1.5 inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${type.color} ${type.bg} ${type.border}`}
          >
            <TypeIcon className="h-2.5 w-2.5" />
            {type.label}
          </span>
        </div>

        {/* App name */}
        <h3 className="text-xs sm:text-sm font-bold text-white text-center leading-tight line-clamp-1 w-full group-hover:text-blue-300 transition-colors">
          {app.name}
        </h3>

        {/* Description */}
        <p className="text-[10px] sm:text-[11px] text-gray-500 text-center line-clamp-2 leading-relaxed mt-1 px-0.5 min-h-[2em]">
          {app.description || "Tap to learn more"}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-1.5 sm:mt-2">
          {ext.install_count != null && ext.install_count > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-600">
              <TrendingUp className="h-2.5 w-2.5" />
              {ext.install_count > 999
                ? `${(ext.install_count / 1000).toFixed(1)}k`
                : ext.install_count}
            </span>
          )}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-2.5 w-2.5 ${
                  s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
      </Link>

      {/* Install button — uses InstallButton component for correct routing */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-white/5">
        <InstallButton app={app} size="sm" className="w-full" />
      </div>
    </div>
  );
}
