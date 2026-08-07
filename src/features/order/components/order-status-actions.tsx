"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "../actions";
import { allowedNextStatuses } from "../status-transitions";
import { ORDER_STATUS_LABELS } from "../status-transitions";
import type { AdminRole } from "@/server/auth/permissions";
import type { OrderStatus } from "../types";

export function OrderStatusActions({
  orderId,
  status,
  role,
}: {
  orderId: string;
  status: OrderStatus;
  role: AdminRole;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const next = allowedNextStatuses(role, status);

  function handleUpdate(toStatus: OrderStatus) {
    if (toStatus === "CANCELLED" && !window.confirm("Cancel this order? This can't be undone.")) {
      return;
    }
    startTransition(async () => {
      try {
        await updateOrderStatusAction({ orderId, toStatus });
        toast.success(`Order marked ${ORDER_STATUS_LABELS[toStatus]}.`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update the order.");
      }
    });
  }

  if (next.length === 0) {
    return <p className="text-muted-foreground text-sm">No further status changes available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {next.map((toStatus) => (
        <Button
          key={toStatus}
          variant={toStatus === "CANCELLED" ? "destructive" : "brand"}
          size="sm"
          disabled={isPending}
          onClick={() => handleUpdate(toStatus)}
        >
          Mark {ORDER_STATUS_LABELS[toStatus]}
        </Button>
      ))}
    </div>
  );
}
