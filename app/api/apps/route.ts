import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createDirectClient } from "@supabase/supabase-js";
import type { AppType } from "@/lib/types";

/**
 * Direct Supabase client for writes.
 * Uses the service role key if available (bypasses RLS completely).
 * Falls back to anon key — works once the RLS policy allows open inserts.
 * AppNex stores only metadata (name, URL, icon) — no files, no size limits.
 */
function writeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Service role key bypasses RLS — get it from Supabase Dashboard → Settings → API
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createDirectClient(url, key, {
    auth: { persistSession: false },
  });
}

// ── GET /api/apps ─────────────────────────────────────────────
// Returns ALL apps — no artificial cap. Supabase free tier holds
// 500 MB of database storage which is enough for millions of app
// metadata records (each row is ~1 KB).
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type") as AppType | null;
  const search = searchParams.get("q");
  // Default 1000, max 10000 per request — use pagination for more
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "1000"), 10000);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  let query = supabase
    .from("apps")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type && ["pwa", "apk", "web"].includes(type)) {
    query = query.eq("type", type);
  }
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── POST /api/apps ────────────────────────────────────────────
// Submits a new app. No per-user limit — AppNex is a metadata store,
// not a file host. Storage is bounded only by Supabase's database quota.
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description, type, url, icon, theme_color,
          store_android, store_ios, store_windows } =
    body as Record<string, string>;

  // ── Validation ────────────────────────────────────────────
  if (!name?.trim())
    return NextResponse.json({ error: "App name is required" }, { status: 400 });
  if (!url?.trim())
    return NextResponse.json({ error: "App URL is required" }, { status: 400 });
  if (!["pwa", "apk", "web", "store"].includes(type))
    return NextResponse.json({ error: "Invalid app type" }, { status: 400 });

  try {
    const p = new URL(url);
    if (p.protocol !== "http:" && p.protocol !== "https:")
      throw new Error("bad protocol");
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // ── Auth (optional) ───────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();

  // ── Duplicate check ───────────────────────────────────────
  const { data: existing } = await supabase
    .from("apps")
    .select("id")
    .eq("url", url.trim())
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "An app with this URL already exists", id: (existing as { id: string }).id },
      { status: 409 }
    );
  }

  // ── Insert ────────────────────────────────────────────────
  const payload: Record<string, unknown> = {
    name: name.trim().slice(0, 100),
    description: (description ?? "").trim().slice(0, 500),
    type,
    url: url.trim(),
    icon: icon ?? "",
    theme_color: theme_color ?? null,
    is_published: true,
    // Store links for native apps
    store_android: store_android ?? null,
    store_ios: store_ios ?? null,
    store_windows: store_windows ?? null,
  };
  if (user) payload.owner_id = user.id;

  const { data, error } = await writeClient()
    .from("apps")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[POST /api/apps] insert error:", error.code, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
