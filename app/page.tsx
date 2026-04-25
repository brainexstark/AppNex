import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import AppRowCard from "@/components/AppRowCard";
import HomeHero from "@/components/HomeHero";
import type { App } from "@/lib/types";
import Link from "next/link";
import {
  Zap, ArrowRight, Rocket, Globe, Smartphone, Package,
  Star, Users, TrendingUp, Shield
} from "lucide-react";

export const revalidate = 30;

async function getApps(): Promise<App[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Globe,
    color: "text-blue-400",
    bg: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/20",
    title: "Paste your URL",
    desc: "Drop any link — a PWA, an APK download, or a regular web app. AppNex accepts them all.",
  },
  {
    step: "02",
    icon: Zap,
    color: "text-yellow-400",
    bg: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-500/20",
    title: "We extract everything",
    desc: "AppNex fetches your manifest, reads your meta tags, and grabs your icon — automatically.",
  },
  {
    step: "03",
    icon: Rocket,
    color: "text-purple-400",
    bg: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/20",
    title: "Publish instantly",
    desc: "Review the preview, hit Submit, and your app is live with a working install button in seconds.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Indie Developer",
    avatar: "SK",
    color: "from-blue-500 to-purple-600",
    text: "I submitted my PWA in literally 15 seconds. The install button worked perfectly on the first try. This is exactly what the web needed.",
    stars: 5,
  },
  {
    name: "Marcus T.",
    role: "Mobile Dev @ Startup",
    avatar: "MT",
    color: "from-green-500 to-teal-600",
    text: "We distribute our Android beta APKs through AppNex now. No more sending raw download links in Slack. Our testers love it.",
    stars: 5,
  },
  {
    name: "Priya R.",
    role: "Full-Stack Engineer",
    avatar: "PR",
    color: "from-pink-500 to-rose-600",
    text: "The metadata extraction is scary good. It pulled the right icon, name, and description from my site without me touching anything.",
    stars: 5,
  },
];

const PLATFORM_STATS = [
  { icon: Users, value: "2,400+", label: "Developers", color: "text-blue-400" },
  { icon: Package, value: "8,900+", label: "Apps listed", color: "text-purple-400" },
  { icon: TrendingUp, value: "1.2M+", label: "Installs tracked", color: "text-green-400" },
  { icon: Shield, value: "99.9%", label: "Uptime SLA", color: "text-yellow-400" },
];

export default async function HomePage() {
  const recentApps = await getApps();

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />

      {/* ── Hero ── */}
      <HomeHero />

      {/* ── Platform stats ── */}
      <section className="border-y border-white/5 bg-[#0F0F1A]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {PLATFORM_STATS.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="text-center">
                <Icon className={`h-5 w-5 ${color} mx-auto mb-2`} />
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            From URL to listing in <span className="gradient-text">3 steps</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ step, icon: Icon, color, bg, border, title, desc }) => (
            <div
              key={step}
              className={`relative rounded-3xl border ${border} bg-gradient-to-br ${bg} p-7 overflow-hidden`}
            >
              <span className="absolute top-4 right-5 text-5xl font-black text-white/5 select-none">{step}</span>
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── App type explainer ── */}
      <section className="border-y border-white/5 bg-[#1A1A2E]/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Every app type, <span className="gradient-text">one platform</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-lg mx-auto">
              AppNex intelligently detects what kind of app you&apos;re submitting and handles the install flow accordingly.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Smartphone,
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                border: "border-blue-400/20",
                title: "Progressive Web Apps",
                badge: "PWA",
                desc: "AppNex detects your /manifest.json and triggers the browser's native install prompt — no App Store needed.",
                detail: "Works on Chrome, Edge, Samsung Internet",
              },
              {
                icon: Package,
                color: "text-green-400",
                bg: "bg-green-400/10",
                border: "border-green-400/20",
                title: "Android APKs",
                badge: "APK",
                desc: "Paste a direct .apk download link. AppNex creates a listing with a Download button that links straight to your file.",
                detail: "No hosting required — link stays on your server",
              },
              {
                icon: Globe,
                color: "text-purple-400",
                bg: "bg-purple-400/10",
                border: "border-purple-400/20",
                title: "Web Applications",
                badge: "Web",
                desc: "Any web URL becomes an installable listing. We extract the title, description, and favicon automatically.",
                detail: "Shows Add to Home Screen hint on mobile",
              },
            ].map(({ icon: Icon, color, bg, border, title, badge, desc, detail }) => (
              <div key={title} className={`rounded-2xl border ${border} bg-[#1A1A2E] p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${color} ${bg} ${border}`}>
                    {badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{desc}</p>
                <p className="text-[11px] text-gray-600 italic">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent apps ── */}
      {recentApps.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Recently submitted</h2>
              <p className="text-xs text-gray-500 mt-0.5">The latest apps added to AppNex</p>
            </div>
            <Link
              href="/apps"
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentApps.map((app) => (
              <AppRowCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      <section className="border-t border-white/5 bg-[#1A1A2E]/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Loved by <span className="gradient-text">developers</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-xs font-bold text-white`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden hero-bg py-20 px-4 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-a absolute -top-20 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to ship your app?
          </h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            Join thousands of developers who use AppNex to distribute their apps without the gatekeeping.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-all"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#0F0F1A]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-extrabold gradient-text">AppNex</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-gray-500">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/apps" className="hover:text-white transition-colors">Explore</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
              <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign up</Link>
            </div>
            <p className="text-xs text-gray-600">© 2026 AppNex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
