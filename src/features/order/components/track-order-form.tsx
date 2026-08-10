"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, PackageCheck, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trackOrderAction } from "../actions";
import { trackOrderSchema, type TrackOrderValues } from "../validations";
import { ORDER_STATUS_LABELS } from "../status-transitions";
import type { TrackedOrder } from "../types";

const STATUS_ICON = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PROCESSING: PackageCheck,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TrackOrderForm() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<TrackOrderValues>({
    resolver: zodResolver(trackOrderSchema),
    defaultValues: { orderNumber: "", recipientPhone: "" },
  });

  async function onSubmit(values: TrackOrderValues) {
    setOrder(null);
    try {
      const result = await trackOrderAction(values);
      setOrder(result);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "Couldn't look up that order. Try again.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="border-border grid gap-4 rounded-xs border p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            placeholder="SNF..."
            aria-invalid={!!errors.orderNumber}
            {...register("orderNumber")}
          />
          {errors.orderNumber ? (
            <p className="text-destructive text-xs">{errors.orderNumber.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recipientPhone">Recipient&rsquo;s phone number</Label>
          <Input
            id="recipientPhone"
            type="tel"
            placeholder="10-digit mobile number"
            aria-invalid={!!errors.recipientPhone}
            {...register("recipientPhone")}
          />
          {errors.recipientPhone ? (
            <p className="text-destructive text-xs">{errors.recipientPhone.message}</p>
          ) : null}
        </div>
        <Button type="submit" variant="brand" disabled={isSubmitting} className="h-10">
          <Search className="size-4" aria-hidden="true" />
          {isSubmitting ? "Looking up…" : "Track Order"}
        </Button>
        {errors.root ? (
          <p className="text-destructive text-sm sm:col-span-3">{errors.root.message}</p>
        ) : null}
      </form>

      {order ? (
        <div className="border-border rounded-xs border p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{order.orderNumber}</p>
              <p className="text-muted-foreground text-sm">
                Placed {formatDate(order.createdAt)} · Delivery to {order.deliveryCity} on{" "}
                {formatDate(order.deliveryDate)}
                {order.deliverySlotLabel ? ` (${order.deliverySlotLabel})` : ""}
              </p>
            </div>
            <span className="bg-brand/10 text-brand rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          <ul className="text-muted-foreground mt-4 flex flex-col gap-1 border-t pt-4 text-sm">
            {order.items.map((item, index) => (
              <li key={index}>
                {item.productTitle}
                {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
              </li>
            ))}
          </ul>

          {order.statusHistory.length > 0 ? (
            <div className="mt-4 border-t pt-4">
              <p className="mb-3 text-sm font-medium">Order timeline</p>
              <ol className="flex flex-col gap-3">
                {order.statusHistory.map((entry) => {
                  const Icon = STATUS_ICON[entry.toStatus];
                  return (
                    <li key={entry.id} className="flex items-start gap-3">
                      <Icon className="text-brand mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium">{ORDER_STATUS_LABELS[entry.toStatus]}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(entry.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
