/**
 * Raw (untyped) Supabase client.
 *
 * Use ONLY for .insert() and .update() calls where the typed client
 * incorrectly infers `never` due to strict generic resolution in
 * @supabase/supabase-js v2 + @supabase/ssr v0.10.
 *
 * For all reads (.select()) and auth, use the typed client from
 * lib/supabase/server.ts or lib/supabase/client.ts.
 */
import { createClient } from "@supabase/supabase-js";

export function rawSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
