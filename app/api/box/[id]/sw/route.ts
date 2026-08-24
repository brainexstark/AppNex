import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateServiceWorkerResponse } from "@/lib/generateServiceWorker";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let targetUrl: string | null = null;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("apps")
      .select("url")
      .eq("id", id)
      .single();
    targetUrl = (data as { url: string } | null)?.url ?? null;
  } catch { /* */ }

  return generateServiceWorkerResponse({
    id,
    targetUrl: targetUrl ?? undefined,
  });
}
