/**
 * AppNex — Profile data-access helpers
 */

import { createClient } from "@/lib/supabase/server";
import type { ProfileUpdate } from "@/lib/database.types";

// ── Get profile by user ID ────────────────────────────────────
export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

// ── Update profile ────────────────────────────────────────────
export async function updateProfile(userId: string, payload: ProfileUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();
  return { data, error };
}

// ── Get notifications ─────────────────────────────────────────
export async function getNotifications(userId: string, limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

// ── Mark notification as read ─────────────────────────────────
export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
  return { error };
}

// ── Mark all notifications as read ───────────────────────────
export async function markAllNotificationsRead(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return { error };
}

// ── Get saved apps ────────────────────────────────────────────
export async function getSavedApps(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_apps")
    .select("app_id, created_at, apps(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data ?? [], error };
}

// ── Save / unsave app ─────────────────────────────────────────
export async function toggleSaveApp(userId: string, appId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("saved_apps")
    .select("app_id")
    .eq("user_id", userId)
    .eq("app_id", appId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_apps")
      .delete()
      .eq("user_id", userId)
      .eq("app_id", appId);
    return { saved: false, error };
  } else {
    const { error } = await supabase
      .from("saved_apps")
      .insert({ user_id: userId, app_id: appId });
    return { saved: true, error };
  }
}
