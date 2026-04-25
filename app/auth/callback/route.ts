import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / magic-link / email-confirmation callback.
 * Supabase redirects here after:
 *   - Email confirmation on signup
 *   - OAuth sign-in (GitHub etc.)
 *   - Password reset
 *
 * After exchanging the code for a session, we redirect to the homepage (/).
 * The `next` param can override the destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "signup", "recovery", etc.
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password recovery → go to reset page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }
      // Everything else (signup confirmation, OAuth) → homepage
      const destination = next && next !== "/login" && next !== "/signup"
        ? next
        : "/";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Failed — redirect to login with error message
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
