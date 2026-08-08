import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Dynamic PWA manifest for each app box.
 * GET /api/box/[id]/manifest
 *
 * The browser fetches this when building the installable PWA wrapper.
 * The manifest points start_url to the app's real URL — so when the
 * installed box icon is tapped, it opens the app directly in standalone mode.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let app: Record<string, unknown> | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("apps")
      .select("id, name, description, icon, url, type, theme_color")
      .eq("id", id)
      .single();
    app = data as Record<string, unknown> | null;
  } catch {
    app = null;
  }

  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  const name = String(app.name ?? "App");
  const description = String(app.description ?? "");
  const icon = String(app.icon ?? "");
  const url = String(app.url ?? "/");
  const themeColor = String(app.theme_color ?? "#0F0F1A");
  const shortName = name.length > 12 ? name.slice(0, 12) : name;

  // Build icons array — prefer the app's own icon, fall back to AppNex icon
  const icons = [];
  if (icon && icon.startsWith("http")) {
    icons.push(
      { src: icon, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: icon, sizes: "512x512", type: "image/png", purpose: "any maskable" }
    );
  }
  // Always include AppNex fallback icons
  icons.push(
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  );

  const manifest = {
    name,
    short_name: shortName,
    description: description || `Open ${name}`,
    // start_url IS the app's real URL — tapping the installed icon opens the app
    start_url: url,
    // scope is "/" so the service worker can intercept navigation back to AppNex
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#0F0F1A",
    theme_color: themeColor || "#3B82F6",
    orientation: "portrait-primary",
    icons,
    // Link back to AppNex for discoverability
    related_applications: [
      {
        platform: "webapp",
        url: `https://app-nex.vercel.app/app/${id}`,
      },
    ],
    prefer_related_applications: false,
  };

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json",
      // Cache for 5 minutes — fresh enough but not hammering the DB
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
    },
  });
}
