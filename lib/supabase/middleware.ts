import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_AUTH_COOKIE_PREFIX = "sb-";

export function hasAuthCookies(request: NextRequest): boolean {
  const cookies = request.cookies.getAll();
  for (const c of cookies) {
    if (c.name.startsWith(SUPABASE_AUTH_COOKIE_PREFIX)) return true;
  }
  return false;
}

export async function updateSession(
  request: NextRequest,
  options: { requireUser?: boolean } = {}
): Promise<{
  response: NextResponse;
  user: { id: string; email?: string } | null;
}> {
  const requireUser = options.requireUser ?? false;

  if (!requireUser && !hasAuthCookies(request)) {
    return { response: NextResponse.next({ request }), user: null };
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 900);

  let user: { id: string; email?: string } | null = null;
  try {
    const { data } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<{ data: { user: null } }>((_, reject) =>
        setTimeout(() => reject(new Error("auth-timeout")), 900)
      ),
    ]);
    user = data?.user ?? null;
  } catch {
    user = null;
  } finally {
    clearTimeout(timeoutId);
  }

  return { response: supabaseResponse, user };
}
