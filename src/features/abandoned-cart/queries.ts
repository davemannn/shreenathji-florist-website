import {
  listAbandonedCarts as listAbandonedCartsRepo,
  type CartSnapshotItem,
} from "@/server/repositories/cart-snapshot.repository";
import type { AdminAbandonedCart } from "./types";

export interface AbandonedCartsResult {
  carts: AdminAbandonedCart[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListAbandonedCartsAdminParams {
  page?: number;
  pageSize?: number;
}

export async function listAbandonedCartsAdmin(
  params: ListAbandonedCartsAdminParams = {},
): Promise<AbandonedCartsResult> {
  const { snapshots, total, page, pageSize } = await listAbandonedCartsRepo(params);

  const carts = snapshots.map((snapshot) => ({
    userId: snapshot.userId,
    customerName: snapshot.user.name,
    customerEmail: snapshot.user.email,
    // Jsonized on write (see cart-snapshot.repository.ts) — trusted shape
    // since only syncCartSnapshotAction (zod-validated) ever writes it.
    items: snapshot.items as unknown as CartSnapshotItem[],
    itemCount: snapshot.itemCount,
    subtotal: snapshot.subtotal,
    updatedAt: snapshot.updatedAt.toISOString(),
    reminderSentAt: snapshot.reminderSentAt?.toISOString(),
  }));

  return { carts, total, page, pageSize };
}
