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

  return generateManifestResponse({
    id,
    name: app.name ?? "App",
    description: app.description || undefined,
    url: app.url,
    icon: app.icon?.startsWith("http") ? app.icon : undefined,
    themeColor: app.theme_color ?? "#3B82F6",
  });
}
