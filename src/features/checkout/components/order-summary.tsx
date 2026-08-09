"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import type { CheckoutValues } from "../validations";
import type { CheckoutTotals } from "../hooks/use-checkout-totals";

interface OrderSummaryProps {
  totals: CheckoutTotals;
  submitting: boolean;
  /** e.g. the address is outside the delivery radius — blocks placing the order without changing the button's own "Placing Order…" label. */
  blocked?: boolean;
}

export function OrderSummary({ totals, submitting, blocked }: OrderSummaryProps) {
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const { control } = useFormContext<CheckoutValues>();

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

      {totals.walletBalance > 0 ? (
        <div className="border-border flex flex-col gap-1.5 border-t pt-3 text-sm">
          <Controller
            control={control}
            name="useWallet"
            render={({ field }) => (
              <label className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-brand size-4"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  Use wallet balance ({formatINR(totals.walletBalance)} available)
                </span>
              </label>
            )}
          />
          {totals.walletAmountUsed > 0 ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet applied</span>
                <span className="text-brand">-{formatINR(totals.walletAmountUsed)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>
                  {totals.remainingTotal === 0 ? "Total (fully paid)" : "Remaining to pay"}
                </span>
                <span>{formatINR(totals.remainingTotal)}</span>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        variant="brand"
        size="lg"
        disabled={submitting || items.length === 0 || blocked}
      >
        {submitting ? "Placing Order…" : "Place Order"}
      </Button>
    </div>
  );
}
