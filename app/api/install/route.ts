import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rawSupabase } from "@/lib/supabase/raw";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { app_id, platform } = body;
  if (!app_id) {
    return NextResponse.json({ error: "app_id required" }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ipHash = ip ? Buffer.from(ip).toString("base64").slice(0, 16) : null;

  const validPlatforms = ["web", "android", "ios", "desktop", "unknown"];
  const safePlatform = validPlatforms.includes(platform) ? platform : "unknown";

  const { error } = await rawSupabase()
    .from("install_events")
    .insert({
      app_id,
      user_id: user?.id ?? null,
      platform: safePlatform,
      ip_hash: ipHash,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
