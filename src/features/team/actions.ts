"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { can, type AdminRole } from "@/server/auth/permissions";
import {
  createStaffAccount,
  findStaffById,
  findUserByEmail,
  invalidateUserSessions,
  setStaffBanned,
  updateStaffRole,
} from "@/server/repositories/team.repository";
import { createTeamMemberSchema, type CreateTeamMemberValues } from "./validations";

/** Roles that require team:manage:all — everyone else is a "junior" role any team-manager can touch. */
const SENIOR_ROLES: AdminRole[] = ["super_admin", "admin"];

/**
 * Deliberately does NOT go through Better Auth's admin-gated
 * `auth.api.createUser`/`signUpEmail` — that surface is now super_admin-
 * only (see adminRoles in server/auth/config.ts), which would block
 * `admin` from creating junior staff even though the permission matrix
 * explicitly allows it. Uses Better Auth's own `hashPassword` (same
 * algorithm real sign-ups use, verified against a real Account row) to
 * create the User + credential Account directly instead.
 */
export async function createTeamMemberAction(input: CreateTeamMemberValues) {
  const session = await requireAdminCapability("team:manage:junior");
  const values = createTeamMemberSchema.parse(input);

  const canManageAll = can(session.role, "team:manage:all");
  if (!canManageAll && SENIOR_ROLES.includes(values.role)) {
    throw new Error("Only Super Admin can create Admin or Super Admin accounts.");
  }

  const existing = await findUserByEmail(values.email);
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const hashedPassword = await hashPassword(values.password);
  const user = await createStaffAccount({
    name: values.name,
    email: values.email,
    role: values.role,
    hashedPassword,
  });

  revalidatePath("/admin/team");
  return { id: user.id };
}

export async function updateTeamMemberRoleAction(userId: string, role: AdminRole) {
  const session = await requireAdminCapability("team:manage:junior");
  const canManageAll = can(session.role, "team:manage:all");

  const target = await findStaffById(userId);
  if (!target) throw new Error("Staff member not found.");

  if (!canManageAll && SENIOR_ROLES.includes(target.role as AdminRole)) {
    throw new Error("You don't have permission to edit this account.");
  }
  if (!canManageAll && SENIOR_ROLES.includes(role)) {
    throw new Error("Only Super Admin can assign Admin or Super Admin roles.");
  }

  await updateStaffRole(userId, role);
  revalidatePath("/admin/team");
}

export async function setTeamMemberActiveAction(userId: string, active: boolean) {
  const session = await requireAdminCapability("team:manage:junior");
  const canManageAll = can(session.role, "team:manage:all");

  const target = await findStaffById(userId);
  if (!target) throw new Error("Staff member not found.");

  if (!canManageAll && SENIOR_ROLES.includes(target.role as AdminRole)) {
    throw new Error("You don't have permission to edit this account.");
  }
  if (target.id === session.userId) {
    throw new Error("You can't deactivate your own account.");
  }

  await setStaffBanned(userId, !active, active ? undefined : "Deactivated by staff");
  if (!active) {
    // Matches Better Auth's own ban behavior (session invalidation) without
    // needing Better-Auth-admin privileges to call its ban API directly.
    await invalidateUserSessions(userId);
  }

  revalidatePath("/admin/team");
}
