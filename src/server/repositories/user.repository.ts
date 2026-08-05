import { prisma } from "@/server/db/prisma";

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}
