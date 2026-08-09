import Link from "next/link";
import { formatINR } from "@/lib/format";
import { OrderStatusBadge } from "./order-status-badge";
import type { AccountOrder } from "../types";

export function OrderHistoryList({
  orders,
  emptyLabel,
}: {
  orders: AccountOrder[];
  emptyLabel: string;
}) {
  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground border-border rounded-xs border border-dashed p-6 text-center text-sm">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.id} className="border-border rounded-xs border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/order-success/${order.orderNumber}`}
                  className="text-sm font-medium hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <Link
                  href={`/invoice/${order.orderNumber}`}
                  target="_blank"
                  className="text-brand text-xs underline underline-offset-2"
                >
                  Invoice
                </Link>
              </div>
              <p className="text-muted-foreground text-xs">
                Placed{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })} ·
                Delivery{" "}
                {new Date(order.deliveryDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <ul className="text-muted-foreground mt-3 flex flex-col gap-1 text-xs">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.productTitle}
                {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">
              {order.paymentMethod === "COD"
                ? order.walletAmountUsed > 0
                  ? `Cash on Delivery (${formatINR(order.walletAmountUsed)} from wallet)`
                  : "Cash on Delivery"
                : order.paymentMethod === "WALLET"
                  ? "Paid from Wallet"
                  : "Paid Online"}{" "}
              ·{" "}
              {order.paymentStatus === "PAID"
                ? "Paid"
                : order.paymentStatus === "REFUNDED"
                  ? "Refunded"
                  : order.paymentStatus === "PARTIALLY_REFUNDED"
                    ? "Partially refunded"
                    : "Payment pending"}
            </span>
            <span className="font-semibold">{formatINR(order.total)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
