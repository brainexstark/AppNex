import Link from "next/link";
import AppIcon from "./AppIcon";
import InstallButton from "./InstallButton";
import type { App } from "@/lib/types";
import { Globe, Smartphone, Package } from "lucide-react";

interface AppCardProps {
  app: App;
}

const typeConfig = {
  pwa: { label: "PWA", icon: Smartphone, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  apk: { label: "APK", icon: Package, color: "text-green-400 bg-green-400/10 border-green-400/20" },
  web: { label: "Web", icon: Globe, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
};

export default function AppCard({ app }: AppCardProps) {
  const type = typeConfig[app.type] ?? typeConfig.web;
  const TypeIcon = type.icon;

  return (
    <article className="app-card group relative flex flex-col rounded-2xl bg-[#1A1A2E] border border-[#2A2A4A] overflow-hidden hover:border-blue-500/40 transition-colors">
      {/* Card body */}
      <Link href={`/app/${app.id}`} className="flex flex-col items-center p-6 pb-4 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-2xl">
        {/* Icon */}
        <div className="mb-4 relative">
          <AppIcon
            src={app.icon}
            name={app.name}
            size={72}
            className="shadow-lg ring-2 ring-white/5"
          />
          {/* Type badge on icon */}
          <span
            className={`absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${type.color}`}
          >
            <TypeIcon className="h-2.5 w-2.5" />
            {type.label}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-center text-base font-semibold text-white leading-tight line-clamp-1 mb-1 group-hover:text-blue-300 transition-colors">
          {app.name}
        </h3>

        {/* Description */}
        <p className="text-center text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {app.description || "No description available."}
        </p>
      </Link>

      {/* Install button */}
      <div className="px-4 pb-5 pt-3 border-t border-[#2A2A4A]/60">
        <InstallButton app={app} size="sm" className="w-full" />
      </div>
    </article>
  );
}
