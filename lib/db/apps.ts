/**
 * AppNex — Apps data-access helpers (server-side)
 * All functions return typed results and never throw — errors are returned.
 */

import { createClient } from "@/lib/supabase/server";
import type { AppInsert, AppUpdate, AppWithStats } from "@/lib/database.types";

// ── List ──────────────────────────────────────────────────────
export async function listApps(opts?: {
  type?: "pwa" | "apk" | "web";
  search?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
  ownerId?: string;
}) {
  const supabase = await createClient();
  const limit = Math.min(opts?.limit ?? 50, 100);
  const offset = opts?.offset ?? 0;

  let query = supabase
    .from("apps_with_stats")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts?.type) query = query.eq("type", opts.type);
  if (opts?.featured) query = query.eq("is_featured", true);
  if (opts?.ownerId) query = query.eq("owner_id", opts.ownerId);
  if (opts?.search) {
    query = query.or(
      `name.ilike.%${opts.search}%,description.ilike.%${opts.search}%`
    );
  }

  const { data, error } = await query;
  return { data: (data ?? []) as AppWithStats[], error };
}

// ── Get single ────────────────────────────────────────────────
export async function getApp(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apps_with_stats")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as AppWithStats | null, error };
}

// ── Create ────────────────────────────────────────────────────
export async function createApp(payload: AppInsert) {
  const supabase = await createClient();

  // Duplicate check
  const { data: existing } = await supabase
    .from("apps")
    .select("id")
    .eq("url", payload.url)
    .maybeSingle();

  if (existing) {
    return {
      data: null,
      error: { message: "An app with this URL already exists", code: "DUPLICATE", existingId: existing.id },
    };
  }

  const { data, error } = await supabase
    .from("apps")
    .insert(payload)
    .select()
    .single();

  return { data, error: error ? { message: error.message, code: error.code } : null };
}

// ── Update ────────────────────────────────────────────────────
export async function updateApp(id: string, payload: AppUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apps")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

// ── Delete ────────────────────────────────────────────────────
export async function deleteApp(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("apps").delete().eq("id", id);
  return { error };
}

// ── Record install event ──────────────────────────────────────
export async function recordInstall(
  appId: string,
  opts?: { userId?: string; platform?: string; ipHash?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("install_events").insert({
    app_id: appId,
    user_id: opts?.userId ?? null,
    platform: (opts?.platform as "web" | "android" | "ios" | "desktop" | "unknown") ?? "unknown",
    ip_hash: opts?.ipHash ?? null,
  });
  return { error };
}

// ── Increment view count ──────────────────────────────────────
export async function incrementViewCount(id: string) {
  const supabase = await createClient();
  // Use rpc for atomic increment
  const { error } = await supabase.rpc("increment_view_count" as never, { app_id: id });
  if (error) {
    // Fallback: read-modify-write (less safe but works without custom RPC)
    const { data } = await supabase.from("apps").select("view_count").eq("id", id).single();
    if (data) {
      await supabase.from("apps").update({ view_count: (data.view_count ?? 0) + 1 }).eq("id", id);
    }
  }
}
