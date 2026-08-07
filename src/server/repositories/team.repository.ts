import { prisma } from "@/server/db/prisma";
import { ADMIN_ROLES } from "@/server/auth/permissions";

const STAFF_ROLES: string[] = [...ADMIN_ROLES];

export async function listStaff() {
  return prisma.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    orderBy: { createdAt: "desc" },
  });
}

export async function findStaffById(id: string) {
  return prisma.user.findFirst({ where: { id, role: { in: STAFF_ROLES } } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export interface CreateStaffInput {
  name: string;
  email: string;
  role: string;
  hashedPassword: string;
}

/**
 * Creates the User + its "credential" Account row in one transaction —
 * matches exactly what Better Auth's own email/password sign-up creates
 * (verified against a real signed-up user's row: providerId="credential",
 * accountId=userId). Deliberately not going through Better Auth's
 * admin-gated `createUser`/`signUpEmail` APIs — see team/actions.ts for why.
 */
export async function createStaffAccount(input: CreateStaffInput) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        emailVerified: true,
      },
    });
    await tx.account.create({
      data: {
        accountId: user.id,
        providerId: "credential",
        password: input.hashedPassword,
        userId: user.id,
      },
    });
    return user;
  });
}

export async function updateStaffRole(userId: string, role: string) {
  return prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function setStaffBanned(userId: string, banned: boolean, banReason?: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { banned, banReason: banned ? (banReason ?? "Deactivated by staff") : null },
  });
}

export async function invalidateUserSessions(userId: string) {
  return prisma.session.deleteMany({ where: { userId } });
}
