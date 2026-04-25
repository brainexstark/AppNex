/**
 * AppNex — Auth helpers (client-side, uses browser Supabase client)
 * All functions return { data, error } — never throw.
 */

import { createClient } from "@/lib/supabase/client";

// ── Sign up ───────────────────────────────────────────────────
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// ── Sign in ───────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// ── Sign out ──────────────────────────────────────────────────
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ── Get current session (client) ──────────────────────────────
export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

// ── Get current user (client) ─────────────────────────────────
export async function getUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

// ── Reset password ────────────────────────────────────────────
export async function resetPassword(email: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/auth/reset-password`,
  });
  return { data, error };
}

// ── Update password ───────────────────────────────────────────
export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
}

// ── OAuth (GitHub) ────────────────────────────────────────────
export async function signInWithGitHub() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${location.origin}/auth/callback` },
  });
  return { data, error };
}
