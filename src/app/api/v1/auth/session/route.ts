import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import { apiSuccess } from "@/server/api/response";

/**
 * v1 REST API — see src/app/api/v1's module doc for scope. This is a thin,
 * stable-shaped wrapper; a mobile client could also hit Better Auth's own
 * generated routes directly (/api/auth/get-session, /sign-in/email, etc. —
 * this app already exposes those), but a versioned envelope here means the
 * mobile app isn't coupled to Better Auth's own response shape.
 *
 * Cookie-session auth only in v1 — same as every other storefront request.
 * A native mobile client (not a web/PWA shell sharing the browser's cookie
 * jar) would need Better Auth's bearer-token plugin enabled first; that's
 * an explicit v2 gap, not silently half-built here.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return apiSuccess({ user: null });
  }

  return apiSuccess({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image ?? null,
    },
  });
}
