import { prisma } from "@/server/db/prisma";

export async function listActiveDeliverySlots() {
  return prisma.deliverySlot.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function findDeliverySlotById(id: string) {
  return prisma.deliverySlot.findUnique({ where: { id } });
}
