import { NextResponse } from "next/server";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  getDeliveryNotificationSummary,
  getOrderNotificationSummary,
} from "@/server/repositories/order.repository";

/**
 * Polled every ~20-30s by use-order-notifications.ts (see the admin panel
 * plan's "Realtime" section for why polling, not SSE/WebSockets, on this
 * host). Response shape is deliberately the same for every role — the
 * client hook doesn't need to know which query ran, just "count" and
 * "latestAt" to diff against what it last saw.
 */
export async function GET() {
  let session;
  try {
    session = await requireAdminCapability(["orders:view:all", "orders:view:assigned"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "delivery_guy") {
    const { assignedCount, latestUpdateAt } = await getDeliveryNotificationSummary(session.userId);
    return NextResponse.json({ count: assignedCount, latestAt: latestUpdateAt });
  }

  const { pendingCount, latestOrderCreatedAt } = await getOrderNotificationSummary();
  return NextResponse.json({ count: pendingCount, latestAt: latestOrderCreatedAt });
}
