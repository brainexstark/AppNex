import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRaw } from "@supabase/supabase-js";
import type { AppType } from "@/lib/types";

// Untyped Supabase client — used only for insert/update where the typed
// client incorrectly infers `never` due to the strict generic resolution
// in @supabase/supabase-js v2 + @supabase/ssr v0.10.
function rawClient() {
  return createRaw(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET /api/apps — list all apps
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as AppType | null;
  const search = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  let query = supabase
    .from("apps")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type && ["pwa", "apk", "web"].includes(type)) {
    query = query.eq("type", type);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// POST /api/apps — submit a new app
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description, type, url, icon, theme_color } =
    body as Record<string, string>;

  if (!name?.trim())
    return NextResponse.json({ error: "App name is required" }, { status: 400 });
  if (!url?.trim())
    return NextResponse.json({ error: "App URL is required" }, { status: 400 });
  if (!["pwa", "apk", "web"].includes(type))
    return NextResponse.json({ error: "Invalid app type" }, { status: 400 });

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      throw new Error("bad protocol");
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Get current user (optional — anonymous submissions allowed)
  const { data: { user } } = await supabase.auth.getUser();

  // Duplicate check (typed client is fine for reads)
  const { data: existing } = await supabase
    .from("apps")
    .select("id")
    .eq("url", url.trim())
    .maybeSingle();

  if (existing) {
    const existingId = (existing as { id: string }).id;
    return NextResponse.json(
      { error: "An app with this URL already exists", id: existingId },
      { status: 409 }
    );
  }

  // Build insert payload
  const insertPayload: Record<string, unknown> = {
    name: name.trim().slice(0, 100),
    description: (description ?? "").trim().slice(0, 500),
    type,
    url: url.trim(),
    icon: icon ?? "",
    theme_color: theme_color ?? null,
  };
  if (user) insertPayload.owner_id = user.id;

  // Use raw client for insert to avoid `never` type inference
  const { data, error } = await rawClient()
    .from("apps")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
