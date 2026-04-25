"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  LifeBuoy, MessageCircle, BookOpen, Zap, ChevronDown, ChevronUp,
  Mail, Code2, MessageSquare, ArrowRight, CheckCircle, Search
} from "lucide-react";

const DOCS = [
  {
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    title: "Quick Start",
    desc: "Submit your first app in under 60 seconds.",
    href: "/docs/quick-start",
  },
  {
    icon: BookOpen,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    title: "App Types Guide",
    desc: "Understand PWA, APK, and Web app differences.",
    href: "/docs/app-types",
  },
  {
    icon: LifeBuoy,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    title: "Install Button",
    desc: "How the universal install button works.",
    href: "/docs/install-button",
  },
  {
    icon: MessageCircle,
    color: "text-green-400",
    bg: "bg-green-400/10",
    title: "API Reference",
    desc: "Integrate AppNex into your own workflow.",
    href: "/docs/api",
  },
];

const FAQS = [
  {
    q: "How does AppNex detect my app type?",
    a: "When you paste a URL, AppNex first checks for a /manifest.json file. If found, it's classified as a PWA. If the URL ends in .apk, it's an APK. Otherwise it's treated as a Web App and we extract the page title, meta description, and favicon.",
  },
  {
    q: "Does AppNex host my app files?",
    a: "No. AppNex only stores metadata (name, description, icon URL, app URL). Your app continues to be served from your own server or CDN. We never upload or re-host your files.",
  },
  {
    q: "Why isn't the PWA install prompt appearing?",
    a: "The browser's beforeinstallprompt event only fires when the PWA meets installability criteria (HTTPS, valid manifest, service worker). AppNex captures this event and triggers it on button click. If the prompt doesn't appear, your PWA may not meet the browser's requirements yet.",
  },
  {
    q: "Can I edit my app listing after submitting?",
    a: "Yes — sign in to your account, go to your dashboard, and click Edit on any listing. You can update the name, description, and icon at any time.",
  },
  {
    q: "How do I delete an app listing?",
    a: "From your dashboard, click the three-dot menu on any app card and select Delete. Deletion is permanent and cannot be undone.",
  },
  {
    q: "Is there a rate limit on submissions?",
    a: "Free accounts can submit up to 5 apps. Pro accounts have no submission limit. API access is rate-limited to 100 requests per minute.",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const filteredFaqs = FAQS.filter(
    (f) =>
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden hero-bg py-20 px-4 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-b absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300">
            <LifeBuoy className="h-3.5 w-3.5" />
            We&apos;re here to help
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Support &amp; <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Find answers, read the docs, or reach out to our team.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Doc cards */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Documentation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOCS.map(({ icon: Icon, color, bg, title, desc, href }) => (
              <Link
                key={title}
                href={href}
                className="group flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#1A1A2E] p-5 hover:border-blue-500/30 hover:bg-[#1E1E35] transition-all"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors mt-auto" />
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="quickstart">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search FAQs…"
                className="rounded-xl bg-[#1A1A2E] border border-white/8 pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors w-56"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length === 0 && (
              <p className="text-sm text-gray-500 py-8 text-center">No results for &ldquo;{search}&rdquo;</p>
            )}
            {filteredFaqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/8 bg-[#1A1A2E] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 animate-fade-in">
                    <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section id="contact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Contact us</h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you within 24 hours.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "support@appnex.app" },
                  { icon: Code2, label: "GitHub", value: "github.com/appnex" },
                  { icon: MessageSquare, label: "Twitter / X", value: "@appnex" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/8">
                      <Icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="glass rounded-3xl p-6">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center animate-fade-in">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                    <CheckCircle className="h-7 w-7 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Message sent!</h3>
                  <p className="text-sm text-gray-400">We&apos;ll reply within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContact} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      required
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your issue or question…"
                      rows={4}
                      required
                      className="w-full resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/60 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Send message <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
