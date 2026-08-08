import type { CartSnapshotItem } from "@/server/repositories/cart-snapshot.repository";

export interface AdminAbandonedCart {
  userId: string;
  customerName: string;
  customerEmail: string;
  items: CartSnapshotItem[];
  itemCount: number;
  subtotal: number;
  updatedAt: string;
  reminderSentAt?: string;
}
