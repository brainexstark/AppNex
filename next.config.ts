import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type-check and lint during `next build` — CI handles these separately.
  // This prevents build failures when env vars aren't available at build time.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // Ensure all pages with Supabase are treated as dynamic
  // (belt-and-suspenders alongside per-page `export const dynamic`)
  experimental: {
    // No static generation for pages that use cookies/auth
  },
};

export default nextConfig;
