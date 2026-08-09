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

/**
 * The real, currently-charged surcharge for a slot type — single source of
 * truth for both what checkout actually charges and what the marketing
 * pages advertise (replaces the old, separately-editable
 * StoreSettings.expressCharge/midnightCharge that could silently drift out
 * of sync with this). Null if no active slot of that type exists.
 */
export async function findActiveDeliverySlotByType(type: "NORMAL" | "FIXED" | "MIDNIGHT") {
  return prisma.deliverySlot.findFirst({
    where: { type, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Admin panel — marketing/content management (Phase 4).
// ---------------------------------------------------------------------------

export async function listDeliverySlotsAdmin() {
  return prisma.deliverySlot.findMany({ orderBy: { sortOrder: "asc" } });
}

export interface UpsertDeliverySlotInput {
  label: string;
  type: "NORMAL" | "FIXED" | "MIDNIGHT";
  extraCharge: number;
  isActive: boolean;
}

export async function createDeliverySlot(input: UpsertDeliverySlotInput) {
  const last = await prisma.deliverySlot.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.deliverySlot.create({ data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 } });
}

export async function updateDeliverySlot(id: string, input: UpsertDeliverySlotInput) {
  return prisma.deliverySlot.update({ where: { id }, data: input });
}

export async function setDeliverySlotActive(id: string, isActive: boolean) {
  return prisma.deliverySlot.update({ where: { id }, data: { isActive } });
}

/**
 * Slots referenced by real orders (Order.deliverySlotId, onDelete: SetNull)
 * hard delete safely — orders already snapshot the slot's label/date/type at
 * booking time, so removing the slot row afterwards doesn't corrupt order
 * history. Deactivating (isActive: false) is the normal way to retire one.
 */
export async function deleteDeliverySlot(id: string) {
  return prisma.deliverySlot.delete({ where: { id } });
}

export async function reorderDeliverySlots(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.deliverySlot.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
}
