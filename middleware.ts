import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root middleware — runs on every request.
 *
 * RULES:
 * - Always refresh the Supabase session (keeps user logged in).
 * - Only /dashboard and /settings require auth — redirect to /login if no session.
 * - /login and /signup are ALWAYS accessible — we do NOT redirect away from them
 *   even if a session exists. The pages themselves handle post-auth navigation.
 *   This prevents race conditions after signup/login where the cookie hasn't
 *   propagated to the middleware yet.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always refresh session cookies
  const { response, user } = await updateSession(request);

  // Only protect these routes — everything else is public
  const protectedPrefixes = ["/dashboard", "/settings"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // NOTE: We intentionally do NOT redirect logged-in users away from /login or /signup.
  // The client-side pages handle that after confirming the session is active.
  // Doing it in middleware causes redirect loops due to cookie timing.

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
