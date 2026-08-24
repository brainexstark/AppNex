import { type NextRequest, NextResponse } from "next/server";
import { updateSession, hasAuthCookies } from "@/lib/supabase/middleware";

const PROTECTED = ["/apps", "/submit", "/dashboard", "/settings"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (!isProtected && !hasAuthCookies(request)) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request, {
    requireUser: isProtected,
  });

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login/:path*",
    "/signup/:path*",
    "/forgot-password/:path*",
    "/reset-password/:path*",
    "/apps/:path*",
    "/submit/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
    "/app/:path*",
    "/api/apps/:path*",
    "/api/reviews/:path*",
    "/api/upload/:path*",
    "/api/install/:path*",
  ],
};
