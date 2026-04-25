import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";

export const metadata: Metadata = {
  title: "AppNex — Install apps from anywhere",
  description:
    "AppNex lets you discover and install PWAs, APKs, and web apps from a single platform. Paste a link, get an instant app listing.",
  keywords: ["PWA", "APK", "web apps", "install", "app store"],
  openGraph: {
    title: "AppNex",
    description: "Install apps from anywhere",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0F0F1A] text-gray-100 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
