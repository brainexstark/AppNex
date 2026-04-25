import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (untyped).
 * Untyped to avoid `never` inference in @supabase/supabase-js v2 strict mode.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
