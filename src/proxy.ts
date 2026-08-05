import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Fast, cookie-presence-only pre-check (no DB call — safe to run in the edge
// proxy runtime). This only confirms "a session cookie exists," not that
// it's valid or that the user has the right role — the authoritative check
// (auth.api.getSession + role === "admin") lives in (admin)/layout.tsx.
// (Next.js 16 renamed the "middleware" file convention to "proxy".)
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*", "/gift-cards/:path*"],
};
