import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Zap, Globe, Smartphone, Package, CheckCircle } from "lucide-react";

export const metadata = { title: "Quick Start — AppNex Docs" };

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link href="/support" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Support
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300 mb-4">
            <Zap className="h-3.5 w-3.5" />
            Quick Start
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Submit your first app in 60 seconds
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            AppNex makes it dead simple to list any app — PWA, APK, or web app — with a working install button. No developer account, no review process.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {[
            {
              step: "1",
              title: "Go to Submit",
              desc: "Click the Submit App button in the top navigation, or go to /submit directly.",
              icon: Globe,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              step: "2",
              title: "Paste your URL",
              desc: "Paste any app URL into the input field. AppNex automatically detects whether it's a PWA, APK, or web app and extracts the name, description, and icon.",
              icon: Zap,
              color: "text-yellow-400",
              bg: "bg-yellow-400/10",
            },
            {
              step: "3",
              title: "Review the preview",
              desc: "Check the auto-generated preview. You can edit the app name and description before submitting.",
              icon: CheckCircle,
              color: "text-green-400",
              bg: "bg-green-400/10",
            },
            {
              step: "4",
              title: "Hit Submit",
              desc: "Click Submit App. Your listing goes live instantly with a working Install button. You'll be redirected to the app listing page.",
              icon: Smartphone,
              color: "text-purple-400",
              bg: "bg-purple-400/10",
            },
          ].map(({ step, title, desc, icon: Icon, color, bg }) => (
            <div key={step} className="flex gap-4 rounded-2xl border border-white/8 bg-[#1A1A2E] p-6">
              <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-600">STEP {step}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 mb-10">
          <h2 className="text-base font-bold text-white mb-3">Tips</h2>
          <ul className="space-y-2">
            {[
              "For PWAs, make sure your site has a valid /manifest.json — AppNex will auto-detect it.",
              "For APKs, paste the direct download link ending in .apk.",
              "Icons are extracted automatically. If the icon looks wrong, you can update it from your dashboard after signing in.",
              "Duplicate URLs are rejected — each app URL can only be listed once.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Next steps */}
        <div className="flex flex-wrap gap-3">
          <Link href="/submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105">
            Submit an App <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/docs/app-types" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-all">
            App Types Guide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
