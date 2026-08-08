import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

export interface CartSnapshotItem {
  productId: string;
  productSlug: string;
  variantId: string;
  productTitle: string;
  variantLabel: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

/**
 * Upsert-on-every-change — the storefront's sync hook debounces client-side
 * (see use-cart-sync.ts), so this is called at most once every few seconds
 * per user, not on every single quantity click. `updatedAt` (via
 * `@updatedAt`) is what "abandoned N hours ago" is measured from.
 */
export async function upsertCartSnapshot(
  userId: string,
  items: CartSnapshotItem[],
  subtotal: number,
) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  // Prisma's Json field wants a plain InputJsonValue, not our named
  // CartSnapshotItem[] interface — structurally identical, just a cast.
  const json = items as unknown as Prisma.InputJsonValue;
  return prisma.cartSnapshot.upsert({
    where: { userId },
    // Clears reminderSentAt on any change too — a cart the customer came
    // back and modified is a fresh abandonment, not the one already emailed.
    update: { items: json, itemCount, subtotal, reminderSentAt: null },
    create: { userId, items: json, itemCount, subtotal },
  });
}

/** Called once a cart empties (cleared, or converted to a real order) — an empty cart isn't "abandoned", it's just not a cart anymore. */
export async function deleteCartSnapshot(userId: string) {
  await prisma.cartSnapshot.deleteMany({ where: { userId } });
}

export interface ListAbandonedCartsParams {
  /** Only snapshots last touched at least this many hours ago — still-shopping carts aren't "abandoned" yet. */
  minAgeHours?: number;
  page?: number;
  pageSize?: number;
}

export async function listAbandonedCarts(params: ListAbandonedCartsParams = {}) {
  const { minAgeHours = 1, page = 1, pageSize = 20 } = params;
  const cutoff = new Date(Date.now() - minAgeHours * 60 * 60 * 1000);

  const where = { itemCount: { gt: 0 }, updatedAt: { lte: cutoff } };

  const [snapshots, total] = await Promise.all([
    prisma.cartSnapshot.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.cartSnapshot.count({ where }),
  ]);

  return { snapshots, total, page, pageSize };
}

export async function markReminderSent(userId: string) {
  await prisma.cartSnapshot.update({ where: { userId }, data: { reminderSentAt: new Date() } });
}
