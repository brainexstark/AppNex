import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Smartphone, Package, Globe, CheckCircle, XCircle } from "lucide-react";

export const metadata = { title: "App Types Guide — AppNex Docs" };

const TYPES = [
  {
    icon: Smartphone,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    badge: "PWA",
    title: "Progressive Web Apps",
    desc: "A PWA is a website that can be installed on your device like a native app. It works offline, sends push notifications, and lives on your home screen.",
    detection: "AppNex checks for a /manifest.json or /manifest.webmanifest file at the root of your URL.",
    install: "On supported browsers (Chrome, Edge, Samsung Internet), AppNex triggers the native browser install prompt. On iOS Safari, users tap Share → Add to Home Screen.",
    pros: ["No app store needed", "Works on all platforms", "Auto-updates", "Offline support"],
    cons: ["Requires HTTPS", "Limited hardware access on iOS", "Browser must support PWA"],
    example: "https://your-pwa.com",
  },
  {
    icon: Package,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    badge: "APK",
    title: "Android APK Files",
    desc: "An APK (Android Package Kit) is the installation file for Android apps. You can distribute beta builds, sideloaded apps, or apps not on the Play Store.",
    detection: "AppNex detects APKs when the URL ends in .apk",
    install: "AppNex creates a Download APK button that links directly to your file. Users download and install it manually (sideloading).",
    pros: ["No Play Store required", "Full Android capabilities", "Direct distribution"],
    cons: ["Android only", "Users must enable 'Install unknown apps'", "No auto-updates"],
    example: "https://yourserver.com/app-release.apk",
  },
  {
    icon: Globe,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    badge: "Web",
    title: "Web Applications",
    desc: "Any web URL that isn't a PWA or APK. AppNex extracts the title, description, and favicon and creates a listing with an Open App button.",
    detection: "Any URL that doesn't have a manifest.json and doesn't end in .apk is treated as a Web App.",
    install: "AppNex opens the app in a new tab and shows an 'Add to Home Screen' hint for mobile users.",
    pros: ["Works for any website", "No setup required", "Cross-platform"],
    cons: ["No native install prompt", "No offline support", "Requires internet"],
    example: "https://any-website.com",
  },
];

export default function AppTypesPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link href="/support" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Support
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            App Types Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            PWA, APK, and Web Apps
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            AppNex supports three types of apps. Understanding the differences helps you submit correctly and gives users the best install experience.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {TYPES.map(({ icon: Icon, color, bg, border, badge, title, desc, detection, install, pros, cons, example }) => (
            <div key={badge} className={`rounded-2xl border ${border} bg-[#1A1A2E] overflow-hidden`}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <span className={`text-xs font-bold ${color}`}>{badge}</span>
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                  </div>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed mb-5">{desc}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="rounded-xl bg-white/3 border border-white/5 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Detection</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{detection}</p>
                  </div>
                  <div className="rounded-xl bg-white/3 border border-white/5 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Install Flow</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{install}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-2">Pros</p>
                    <ul className="space-y-1">
                      {pros.map((p) => (
                        <li key={p} className="flex items-start gap-1.5 text-xs text-gray-400">
                          <CheckCircle className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-2">Cons</p>
                    <ul className="space-y-1">
                      {cons.map((c) => (
                        <li key={c} className="flex items-start gap-1.5 text-xs text-gray-400">
                          <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg bg-[#0F0F1A] border border-white/5 px-3 py-2">
                  <span className="text-xs text-gray-600">Example URL: </span>
                  <code className="text-xs text-blue-400">{example}</code>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105">
            Submit an App <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/docs/install-button" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-all">
            Install Button Guide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
