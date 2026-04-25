import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root middleware — runs on every request.
 *
 * 1. Refreshes the Supabase session so the user stays logged in.
 * 2. Protects /dashboard and /settings — redirects to /login if no session.
 * 3. Redirects logged-in users away from /login and /signup to /dashboard.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always refresh session first
  const { response, user } = await updateSession(request);

  // Protected routes — require authentication
  const protectedPrefixes = ["/dashboard", "/settings"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  // Auth-only routes — redirect away if already signed in
  const authOnlyRoutes = ["/login", "/signup", "/forgot-password"];
  const isAuthOnly = authOnlyRoutes.includes(pathname);

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
