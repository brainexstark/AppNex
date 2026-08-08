import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AppRow = {
  name: string;
  description: string;
  icon: string;
  url: string;
  theme_color: string | null;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let app: AppRow | null = null;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("apps")
      .select("name, description, icon, url, theme_color")
      .eq("id", id)
      .single();
    app = data as AppRow | null;
  } catch { /* */ }

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const name       = (app.name ?? "App").slice(0, 45);
  const shortName  = (app.name ?? "App").slice(0, 12);
  const icon       = app.icon?.startsWith("http") ? app.icon : null;
  const themeColor = app.theme_color ?? "#3B82F6";

  const icons: object[] = icon
    ? [
        { src: icon, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: icon, sizes: "512x512", type: "image/png", purpose: "any maskable" },
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ]
    : [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ];

  const manifest = {
    id: `/app/${id}`,
    name,
    short_name: shortName,
    description: app.description || `Open ${name}`,
    start_url: app.url,
    scope: `/app/${id}`,
    display: "standalone",
    background_color: "#0F0F1A",
    theme_color: themeColor,
    orientation: "any",
    icons,
    prefer_related_applications: false,
  };

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
    },
  });
}
