import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rawSupabase } from "@/lib/supabase/raw";

// GET /api/reviews?app_id=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const app_id = new URL(req.url).searchParams.get("app_id");

  if (!app_id) {
    return NextResponse.json({ error: "app_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(full_name, avatar_url)")
    .eq("app_id", app_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to leave a review" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { app_id, rating, body: reviewBody } = body as {
    app_id: string;
    rating: number;
    body?: string;
  };

  if (!app_id) return NextResponse.json({ error: "app_id required" }, { status: 400 });
  if (!rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });

  const { data, error } = await rawSupabase()
    .from("reviews")
    .upsert(
      { app_id, user_id: user.id, rating, body: reviewBody ?? null },
      { onConflict: "app_id,user_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
