import { prisma } from "@/server/db/prisma";

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

/** Case-sensitive exact match — email is stored/compared as entered, same as Better Auth's own lookup. */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
