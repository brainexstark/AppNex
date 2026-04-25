import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LifeBuoy, Smartphone, Download, ExternalLink, CheckCircle } from "lucide-react";

export const metadata = { title: "Install Button — AppNex Docs" };

export default function InstallButtonPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link href="/support" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Support
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 mb-4">
            <LifeBuoy className="h-3.5 w-3.5" />
            Install Button
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            How the Install button works
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Every app listing on AppNex has an Install button. The behaviour changes depending on the app type.
          </p>
        </div>

        <div className="space-y-6 mb-12">
          {[
            {
              icon: Smartphone,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
              badge: "PWA",
              title: "Progressive Web Apps",
              steps: [
                "AppNex listens for the browser's beforeinstallprompt event.",
                "When you click Install, it triggers the native browser install dialog.",
                "If the browser hasn't fired the prompt yet (e.g. on iOS), AppNex opens the app and shows a hint: tap Share → Add to Home Screen.",
                "Once installed, the button changes to Installed.",
              ],
              note: "The install prompt only appears if the PWA meets browser installability criteria: HTTPS, valid manifest, and a registered service worker.",
            },
            {
              icon: Download,
              color: "text-green-400",
              bg: "bg-green-400/10",
              badge: "APK",
              title: "Android APK Files",
              steps: [
                "Clicking Install APK triggers a direct download of the .apk file.",
                "Android will prompt you to install the downloaded file.",
                "You may need to enable 'Install from unknown sources' in Android settings.",
                "The app installs like any other Android app.",
              ],
              note: "AppNex never hosts APK files. The download link goes directly to the URL you submitted.",
            },
            {
              icon: ExternalLink,
              color: "text-purple-400",
              bg: "bg-purple-400/10",
              badge: "Web",
              title: "Web Applications",
              steps: [
                "Clicking Install opens the web app in a new browser tab.",
                "A tooltip appears with instructions to add it to your home screen.",
                "On Android Chrome: tap the three-dot menu → Add to Home Screen.",
                "On iOS Safari: tap Share → Add to Home Screen.",
              ],
              note: "Web apps don't have a native install prompt. The Add to Home Screen shortcut creates a bookmark-style icon on your device.",
            },
          ].map(({ icon: Icon, color, bg, badge, title, steps, note }) => (
            <div key={badge} className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <span className={`text-xs font-bold ${color}`}>{badge}</span>
                  <h2 className="text-base font-bold text-white">{title}</h2>
                </div>
              </div>
              <ol className="space-y-2 mb-4">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <span className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full ${bg} text-[10px] font-bold ${color}`}>
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="rounded-lg bg-white/3 border border-white/5 px-4 py-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="text-gray-400 font-semibold">Note: </span>{note}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 mb-10">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Best practices for app owners
          </h2>
          <ul className="space-y-2">
            {[
              "For PWAs: ensure your site is on HTTPS, has a valid manifest.json with icons, and registers a service worker.",
              "For APKs: host your .apk on a reliable server with a stable URL. AppNex stores the link, not the file.",
              "For Web Apps: make sure your site has good meta tags (og:title, og:description, og:image) for the best listing appearance.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />{tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/apps" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105">
            Browse Apps <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/docs/api" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-all">
            API Reference <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
