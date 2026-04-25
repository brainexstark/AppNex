/**
 * Auth helpers — lazy Supabase client, safe for SSR.
 *
 * emailRedirectTo uses NEXT_PUBLIC_SITE_URL so confirmation emails
 * link to the real deployed domain, not localhost.
 */

async function getClient() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

function siteOrigin(): string {
  // In browser, use actual origin (works for both dev and prod)
  if (typeof window !== "undefined") return window.location.origin;
  // Server-side fallback — use env var
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://appnex.app";
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await getClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteOrigin()}/auth/callback`,
    },
  });
}

export async function signIn(email: string, password: string) {
  const supabase = await getClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = await getClient();
  return supabase.auth.signOut();
}

export async function getSession() {
  const supabase = await getClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getUser() {
  const supabase = await getClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

export async function resetPassword(email: string) {
  const supabase = await getClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin()}/auth/reset-password`,
  });
}

export async function updatePassword(newPassword: string) {
  const supabase = await getClient();
  return supabase.auth.updateUser({ password: newPassword });
}

export async function signInWithGitHub() {
  const supabase = await getClient();
  return supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${siteOrigin()}/auth/callback` },
  });
}
