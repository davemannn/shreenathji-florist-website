import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import {
  can,
  defaultAdminLandingFor,
  isAdminRole,
  type AdminRole,
  type Capability,
} from "./permissions";

/**
 * `auth.api.getSession()` hits the DB — `cache()` de-dupes it across every
 * `requireAdminSession`/`requireAdminCapability` call within one request
 * tree (a page plus several nested server components each checking their
 * own capability), same request only ever pays for the lookup once.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export interface AdminSession {
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
}

/**
 * For Server Components (pages/layouts). Redirects to sign-in if not
 * authenticated as staff at all; redirects to /admin (a safe landing page)
 * if authenticated but missing the specific capability requested — that's
 * a permission gap, not an auth gap, so sign-in would be the wrong target.
 */
export async function requireAdminSession(capability?: Capability): Promise<AdminSession> {
  const session = await getSession();

  if (!session || !isAdminRole(session.user.role)) {
    redirect("/sign-in?redirectTo=/admin");
  }

  const role = session.user.role;

  if (capability && !can(role, capability)) {
    redirect(defaultAdminLandingFor(role));
  }

  return { userId: session.user.id, name: session.user.name, email: session.user.email, role };
}

/**
 * For Server Actions — throws instead of redirecting (an action is mid
 * mutation, not rendering a page, so there's nowhere to redirect *to*; the
 * caller's try/catch + toast surfaces this like any other action error).
 */
export async function requireAdminCapability(capability: Capability): Promise<AdminSession> {
  const session = await getSession();

  if (!session || !isAdminRole(session.user.role)) {
    throw new Error("You must be signed in as staff to do this.");
  }

  const role = session.user.role;

  if (!can(role, capability)) {
    throw new Error("You don't have permission to do this.");
  }

  return { userId: session.user.id, name: session.user.name, email: session.user.email, role };
}
