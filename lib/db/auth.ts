/**
 * Auth helpers — lazy Supabase client, safe for SSR.
 *
 * ALL auth callbacks (OAuth, email confirmation, password reset)
 * point to https://app-nex.vercel.app — never localhost.
 */

async function getClient() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

/** Canonical origin — always the Vercel deployment */
const SITE_URL = "https://app-nex.vercel.app";

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await getClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${SITE_URL}/auth/callback`,
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

export async function resetPassword(email: string) {
  const supabase = await getClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/reset-password`,
  });
}

export async function updatePassword(newPassword: string) {
  const supabase = await getClient();
  return supabase.auth.updateUser({ password: newPassword });
}

export async function signInWithGoogle() {
  const supabase = await getClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${SITE_URL}/auth/callback`,
      queryParams: { prompt: "select_account" },
    },
  });
}

export async function signInWithGitHub() {
  const supabase = await getClient();
  return supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${SITE_URL}/auth/callback` },
  });
}

export async function signInWithApple() {
  const supabase = await getClient();
  return supabase.auth.signInWithOAuth({
    provider: "apple",
    options: { redirectTo: `${SITE_URL}/auth/callback` },
  });
}
