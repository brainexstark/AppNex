import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://appnex.app"
  ),
  title: "AppNex — Install Apps From Anywhere",
  description:
    "The universal app distribution platform. Paste any URL — PWA, APK, or web app — and get a clean listing with a working install button. No gatekeeping.",
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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152.png", sizes: "152x152" },
      { url: "/icons/icon-192.png", sizes: "192x192" },
    ],
    shortcut: "/icon.svg",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA meta tags */}
        <meta name="application-name" content="AppNex" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AppNex" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Splash screens for iOS */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
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
