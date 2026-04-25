/**
 * AppNex — Reviews data-access helpers
 */

import { createClient } from "@/lib/supabase/server";
import type { ReviewInsert } from "@/lib/database.types";

// ── Get reviews for an app ────────────────────────────────────
export async function getReviews(appId: string, limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(full_name, avatar_url)")
    .eq("app_id", appId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

// ── Submit a review ───────────────────────────────────────────
export async function submitReview(payload: ReviewInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .upsert(payload, { onConflict: "app_id,user_id" })
    .select()
    .single();
  return { data, error };
}

// ── Delete a review ───────────────────────────────────────────
export async function deleteReview(reviewId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  return { error };
}
