import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import PWAInstallBanner from "@/components/PWAInstallBanner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app-nex.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AppNex — Install All Websites From Anywhere",
  description:
    "INSTALL ALL WEBSITES FROM ANYWHERE",
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
    title: "AppNex — Install All Websites From Anywhere",
    description: "The universal app distribution platform.",
    type: "website",
    siteName: "AppNex",
    images: [{ url: "/icon.svg", width: 1024, height: 1024, alt: "AppNex" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AppNex",
    description: "Install all websites from anywhere",
    images: ["/icon.svg"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icons/favicon-32.png",
    apple: [
      { url: "/icons/apple-touch-icon-120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/apple-touch-icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/apple-touch-icon-167.png", sizes: "167x167", type: "image/png" },
      { url: "/icons/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F0F1A" },
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
  ],
  width: "device-width",
  initialScale: 1,
  // Cap max scale at 2 to prevent extreme accidental zoom that triggers
  // "broken screen" layout on mobile; still allows accessibility zoom.
  maximumScale: 2,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
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
        <meta name="msapplication-TileColor" content="#0F0F1A" />
        <meta name="msapplication-TileImage" content="/icons/mstile-144.png" />
        <meta name="msapplication-square70x70logo" content="/icons/icon-72.png" />
        <meta name="msapplication-square150x150logo" content="/icons/mstile-144.png" />
        <meta name="msapplication-square310x310logo" content="/icons/mstile-310x310.png" />
        <meta name="msapplication-wide310x150logo" content="/icons/mstile-558x270.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/favicon-48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" href="/icons/apple-touch-icon-precomposed.png" />
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
