/**
 * Auth helpers — all use lazy dynamic import of the Supabase client
 * so they are safe to import in any page without triggering SSR errors.
 */

async function getClient() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await getClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
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
    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/reset-password`,
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
    options: {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
    },
  });
}
