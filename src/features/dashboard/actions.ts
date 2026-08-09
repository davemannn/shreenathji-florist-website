"use server";

import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import { isAdminRole } from "@/server/auth/permissions";
import { updateAdminNavOrder } from "@/server/repositories/user.repository";
import { adminNav } from "@/config/admin-navigation";

const KNOWN_HREFS = new Set(adminNav.map((item) => item.href));

/**
 * Personal sidebar reorder — deliberately session-gated only, not
 * capability-gated. Any staff role can rearrange their own admin sidebar;
 * this never changes what a role can see (adminNav's own `capability`
 * field still governs that), only the order it's listed in for the one
 * person saving it.
 */
export async function updateAdminNavOrderAction(orderedHrefs: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdminRole(session.user.role)) {
    throw new Error("You must be signed in as staff.");
  }

  // Trust nothing from the client beyond "is this actually one of our nav
  // hrefs" — a stray/forged entry would otherwise sit inertly in the
  // stored order forever (harmless, but pointless to allow).
  const filtered = orderedHrefs.filter((href) => KNOWN_HREFS.has(href));
  await updateAdminNavOrder(session.user.id, filtered);
}
