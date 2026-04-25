import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import PWAInstallBanner from "@/components/PWAInstallBanner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://appnex.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AppNex — Install Apps From Anywhere",
  description:
    "The universal app distribution platform. Paste any URL — PWA, APK, or web app — and get a clean listing with a working install button.",
  keywords: ["PWA", "APK", "web apps", "install", "app store", "app distribution"],
  authors: [{ name: "AppNex" }],
  creator: "AppNex",
  publisher: "AppNex",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AppNex",
  },
  openGraph: {
    title: "AppNex — Install Apps From Anywhere",
    description: "The universal app distribution platform.",
    type: "website",
    siteName: "AppNex",
    images: [{ url: "/icon.svg", width: 1024, height: 1024, alt: "AppNex" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AppNex",
    description: "Install apps from anywhere",
    images: ["/icon.svg"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F0F1A" },
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="AppNex" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AppNex" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-TileImage" content="/icon.svg" />
        {/* Apple touch icon — uses the SVG directly */}
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen bg-[#0F0F1A] text-gray-100 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <ServiceWorkerRegistrar />
        <PWAInstallBanner />
      </body>
    </html>
  );
}
