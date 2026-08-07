import { Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderStatusActions } from "./order-status-actions";
import type { AdminRole } from "@/server/auth/permissions";
import type { DeliveryOrderCard as DeliveryOrderCardType } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Mobile-first — large tap targets, tap-to-call, one-tap status update. Built for someone using this while out on the road, not a desk-bound table. */
export function DeliveryOrderCard({
  order,
  role,
}: {
  order: DeliveryOrderCardType;
  role: AdminRole;
}) {
  return (
    <div className="border-border flex flex-col gap-3 rounded-xs border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{order.orderNumber}</p>
          <p className="text-muted-foreground text-xs">
            {formatDate(order.deliveryDate)}
            {order.deliverySlotLabel ? ` · ${order.deliverySlotLabel}` : ""} · {order.itemCount}{" "}
            item
            {order.itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <p className="font-medium">{order.recipientName}</p>
        <a href={`tel:${order.recipientPhone}`} className="text-brand flex items-center gap-1.5">
          <Phone className="size-3.5" aria-hidden="true" />
          {order.recipientPhone}
        </a>
        <p className="text-muted-foreground flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            {order.deliveryLine1}
            {order.deliveryLine2 ? `, ${order.deliveryLine2}` : ""}, {order.deliveryCity},{" "}
            {order.deliveryState} {order.deliveryPincode}
          </span>
        </p>
      </div>

      {order.messageCard ? (
        <p className="text-muted-foreground text-xs italic">&ldquo;{order.messageCard}&rdquo;</p>
      ) : null}
      {order.giftWrap ? (
        <Badge variant="secondary" className="w-fit">
          Gift wrapped
        </Badge>
      ) : null}

      <div className="border-t pt-3">
        <OrderStatusActions orderId={order.id} status={order.status} role={role} />
      </div>
    </div>
  );
}
