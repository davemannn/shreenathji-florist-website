"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { BASE_DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { effectiveSlotCharge, todayIsoIst } from "@/lib/delivery";
import { useCartStore, type CartLineItem, type AppliedCoupon } from "@/stores/cart-store";
import type { CheckoutValues } from "../validations";
import type { DeliverySlotOption } from "../types";

interface OrderSummaryProps {
  deliverySlots: DeliverySlotOption[];
  submitting: boolean;
}

export function OrderSummary({ deliverySlots, submitting }: OrderSummaryProps) {
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const { watch } = useFormContext<CheckoutValues>();
  const selectedSlotId = watch("deliverySlotId");
  const deliveryDate = watch("deliveryDate");

  const totals = computeTotals(items, appliedCoupon, deliverySlots, selectedSlotId, deliveryDate);

  return (
    <div className="border-border sticky top-24 flex h-fit flex-col gap-4 rounded-xs border p-5">
      <h2 className="font-semibold">Order Summary</h2>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.variantId} className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {item.productTitle} ({item.variantLabel}) × {item.quantity}
            </span>
            <span>{formatINR(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1.5 border-t pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatINR(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount ({appliedCoupon?.code})</span>
            <span className="text-brand">-{formatINR(totals.discount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span>{totals.deliveryCharge === 0 ? "Free" : formatINR(totals.deliveryCharge)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <span>Total</span>
          <span>{formatINR(totals.total)}</span>
        </div>
      </div>

      <Button type="submit" variant="brand" size="lg" disabled={submitting || items.length === 0}>
        {submitting ? "Placing Order…" : "Place Order"}
      </Button>
    </div>
  );
}

function computeTotals(
  items: CartLineItem[],
  appliedCoupon: AppliedCoupon | null,
  deliverySlots: DeliverySlotOption[],
  selectedSlotId: string | undefined,
  deliveryDate: string,
) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon?.discount ?? 0;
  const afterDiscount = subtotal - discount;
  const selectedSlot = deliverySlots.find((slot) => slot.id === selectedSlotId);
  // Express/Instant is always "today" regardless of the date field (it's
  // hidden once selected) — everything else prices off the picked date.
  const slotCharge = selectedSlot
    ? effectiveSlotCharge(
        selectedSlot.type,
        selectedSlot.type === "FIXED" ? todayIsoIst() : deliveryDate,
        selectedSlot.extraCharge,
      )
    : 0;
  const deliveryCharge =
    (afterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_CHARGE) + slotCharge;
  const total = afterDiscount + deliveryCharge;

  return { subtotal, discount, deliveryCharge, total };
}
