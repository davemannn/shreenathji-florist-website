import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getMyDeliveries } from "@/features/order/queries";
import { DeliveryOrderCard } from "@/features/order/components/delivery-order-card";
import { NewActivityBanner } from "@/features/dashboard/components/new-activity-banner";

export const metadata: Metadata = {
  title: "My Deliveries",
};

// delivery_guy's dedicated, mobile-first surface — a genuinely separate
// route from /admin/orders (not the same table with conditional
// rendering), per the admin panel plan. Both share the same
// order.repository.ts/status-update action underneath.
export default async function MyDeliveriesPage() {
  const session = await requireAdminSession("orders:view:assigned");
  const orders = await getMyDeliveries(session.userId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">My Deliveries</h1>
        <p className="text-muted-foreground text-sm">
          {orders.length} active {orders.length === 1 ? "delivery" : "deliveries"}
        </p>
      </div>

      <NewActivityBanner label="Your deliveries were just updated." />

      {orders.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center text-sm">
          No deliveries assigned to you right now.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <DeliveryOrderCard key={order.id} order={order} role={session.role} />
          ))}
        </div>
      )}
    </div>
  );
}
