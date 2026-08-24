import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateManifestResponse } from "@/lib/generateManifest";

type AppRow = {
  name: string;
  description: string;
  icon: string;
  url: string;
  theme_color: string | null;
};

function deriveFaviconFromUrl(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (!hostname) return undefined;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`;
  } catch {
    return undefined;
  }
}

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

  const resolvedIcon = app.icon?.startsWith("http")
    ? app.icon
    : deriveFaviconFromUrl(app.url);

  return generateManifestResponse({
    id,
    name: app.name ?? "App",
    description: app.description || undefined,
    url: app.url,
    icon: resolvedIcon,
    themeColor: app.theme_color ?? "#3B82F6",
    // Same-origin only — these satisfy browser PWA installability.
    // When the user opens the installed shortcut, start_url loads /app/[id],
    // and StandaloneRedirect on that page bounces them to the real app URL.
    startUrl: `/app/${id}`,
    scope: `/app/${id}`,
  });
}
