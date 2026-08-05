import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { listOrdersForUser } from "@/server/repositories/order.repository";
import { OrderHistoryList } from "@/features/account/components/order-history-list";
import { ACTIVE_ORDER_STATUSES, type AccountOrder } from "@/features/account/types";

export const metadata: Metadata = {
  title: "Your Orders",
};

export default async function AccountOrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in?redirectTo=/account/orders");
  }

  const rows = await listOrdersForUser(session.user.id);

  const orders: AccountOrder[] = rows.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    deliveryDate: order.deliveryDate.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productTitle: item.productTitle,
      variantLabel: item.variantLabel ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  }));

  const activeOrders = orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status));
  const pastOrders = orders.filter((order) => !ACTIVE_ORDER_STATUSES.includes(order.status));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Active Orders</h2>
        <OrderHistoryList orders={activeOrders} emptyLabel="No active orders right now." />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Past Orders</h2>
        <OrderHistoryList orders={pastOrders} emptyLabel="No past orders yet." />
      </section>
    </div>
  );
}
