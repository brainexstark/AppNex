import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/upload
 * Uploads a file to Supabase Storage.
 *
 * Form fields:
 *   file     — the file to upload (required)
 *   bucket   — "app-icons" | "app-screenshots" | "apk-files" (default: app-icons)
 *   path     — optional custom path inside the bucket
 *
 * Returns: { url: string, path: string }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bucket = (formData.get("bucket") as string) || "app-icons";
  const validBuckets = ["app-icons", "app-screenshots", "apk-files"];
  if (!validBuckets.includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  // Build storage path: userId/timestamp-filename
  const ext = file.name.split(".").pop() ?? "bin";
  const customPath = formData.get("path") as string | null;
  const storagePath = customPath
    ? `${user.id}/${customPath}`
    : `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  return NextResponse.json({ url: publicUrl, path: storagePath }, { status: 201 });
}
