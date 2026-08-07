import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getOrderDetail, getActiveDeliveryPersons } from "@/features/order/queries";
import { OrderStatusBadge } from "@/features/order/components/order-status-badge";
import { OrderStatusActions } from "@/features/order/components/order-status-actions";
import { DeliveryAssignmentSelect } from "@/features/order/components/delivery-assignment-select";
import { OrderStatusHistoryList } from "@/features/order/components/order-status-history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order Detail",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const session = await requireAdminSession("orders:view:all");

  const [order, deliveryPersons] = await Promise.all([
    getOrderDetail(id),
    getActiveDeliveryPersons(),
  ]);
  if (!order) notFound();

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm">
            {order.customerName} ({order.customerEmail}) · Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/invoice/${order.orderNumber}`} target="_blank" />}
          >
            <FileText className="size-3.5" aria-hidden="true" />
            View Invoice
          </Button>
          <OrderStatusBadge status={order.status} className="h-6 px-3 text-sm" />
        </div>
      </div>

      <section className="border-border flex flex-col gap-3 rounded-xs border p-5">
        <h2 className="font-semibold">Update Status</h2>
        <OrderStatusActions orderId={order.id} status={order.status} role={session.role} />
      </section>

      <section className="border-border flex flex-col gap-3 rounded-xs border p-5">
        <h2 className="font-semibold">Delivery Assignment</h2>
        <DeliveryAssignmentSelect
          orderId={order.id}
          deliveryPersons={deliveryPersons}
          assignedId={order.assignedDeliveryPersonId}
        />
        {order.assignedDeliveryPersonPhone ? (
          <p className="text-muted-foreground text-xs">{order.assignedDeliveryPersonPhone}</p>
        ) : null}
      </section>

      <section className="border-border grid gap-6 rounded-xs border p-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <h2 className="mb-1 font-semibold">Delivery Details</h2>
          <p className="text-sm">{order.recipientName}</p>
          <p className="text-muted-foreground text-sm">{order.recipientPhoneFull}</p>
          <p className="text-muted-foreground text-sm">
            {order.deliveryLine1}
            {order.deliveryLine2 ? `, ${order.deliveryLine2}` : ""}, {order.deliveryCity},{" "}
            {order.deliveryState} {order.deliveryPincode}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Expected: {formatDate(order.deliveryDate)}
            {order.deliverySlotLabel ? ` · ${order.deliverySlotLabel}` : ""}
          </p>
          {order.deliveredAt ? (
            <p className="text-sm">Delivered: {formatDate(order.deliveredAt)}</p>
          ) : null}
          {order.messageCard ? (
            <p className="text-muted-foreground mt-2 text-sm italic">
              &ldquo;{order.messageCard}&rdquo;
            </p>
          ) : null}
          {order.giftWrap ? <Badge variant="secondary">Gift wrapped</Badge> : null}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="mb-1 font-semibold">Payment</h2>
          <p className="text-sm">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}
          </p>
          <Badge
            variant={order.paymentStatus === "PAID" ? "secondary" : "outline"}
            className="w-fit"
          >
            {order.paymentStatus}
          </Badge>
          {order.couponCode ? (
            <p className="text-muted-foreground mt-2 text-sm">Coupon: {order.couponCode}</p>
          ) : null}
        </div>
      </section>

      <section className="border-border flex flex-col gap-3 rounded-xs border p-5">
        <h2 className="font-semibold">Items</h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.productTitle}
                {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
              </span>
              <span>{formatINR(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-brand">-{formatINR(order.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{order.deliveryCharge === 0 ? "Free" : formatINR(order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="border-border flex flex-col gap-3 rounded-xs border p-5">
        <h2 className="font-semibold">Status History</h2>
        <OrderStatusHistoryList entries={order.statusHistory} />
      </section>
    </div>
  );
}
