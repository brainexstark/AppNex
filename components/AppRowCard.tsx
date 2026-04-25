import Link from "next/link";
import AppIcon from "./AppIcon";
import InstallButton from "./InstallButton";
import type { App } from "@/lib/types";
import { Globe, Smartphone, Package, Star } from "lucide-react";

interface AppRowCardProps {
  app: App;
  rank?: number;
  showRank?: boolean;
}

const typeConfig = {
  pwa: {
    label: "PWA",
    icon: Smartphone,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    dot: "bg-blue-400",
  },
  apk: {
    label: "APK",
    icon: Package,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    dot: "bg-green-400",
  },
  web: {
    label: "Web",
    icon: Globe,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    dot: "bg-purple-400",
  },
};

export default function AppRowCard({ app, rank, showRank = false }: AppRowCardProps) {
  const type = typeConfig[app.type] ?? typeConfig.web;
  const TypeIcon = type.icon;

  return (
    <article className="group flex items-center gap-4 rounded-2xl border border-[#2A2A4A] bg-[#1A1A2E] px-4 py-3.5 hover:border-blue-500/30 hover:bg-[#1E1E35] transition-all duration-200">
      {/* Rank number */}
      {showRank && rank !== undefined && (
        <span className="w-5 flex-shrink-0 text-center text-sm font-bold text-gray-600 select-none">
          {rank}
        </span>
      )}

      {/* App icon — clickable */}
      <Link
        href={`/app/${app.id}`}
        className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
        tabIndex={-1}
        aria-hidden="true"
      >
        <AppIcon
          src={app.icon}
          name={app.name}
          size={56}
          className="shadow-md ring-1 ring-white/5 transition-transform group-hover:scale-105"
        />
      </Link>

      {/* App info — clickable */}
      <Link
        href={`/app/${app.id}`}
        className="flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-white leading-tight truncate group-hover:text-blue-300 transition-colors">
            {app.name}
          </h3>
        </div>

        {/* Type badge + description */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0 ${type.color} ${type.bg} ${type.border}`}
          >
            <TypeIcon className="h-2.5 w-2.5" />
            {type.label}
          </span>
          {app.description && (
            <span className="text-xs text-gray-500 truncate">
              {app.description}
            </span>
          )}
        </div>

        {/* Rating row — decorative, Play Store style */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-2.5 w-2.5 ${s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
            />
          ))}
          <span className="text-[10px] text-gray-600 ml-1">4.0</span>
          <span className="text-[10px] text-gray-700 mx-1">·</span>
          <span className="text-[10px] text-gray-600">Free</span>
        </div>
      </Link>

      {/* Install button — always visible */}
      <div className="flex-shrink-0">
        <InstallButton app={app} size="sm" />
      </div>
    </article>
  );
}
