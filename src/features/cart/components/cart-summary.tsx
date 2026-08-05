import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { BASE_DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import type { AppliedCoupon } from "../types";

interface CartSummaryProps {
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
}

export function CartSummary({ subtotal, appliedCoupon }: CartSummaryProps) {
  const discount = appliedCoupon?.discount ?? 0;
  const afterDiscount = subtotal - discount;
  const deliveryCharge = afterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_CHARGE;
  const total = afterDiscount + deliveryCharge;

  return (
    <div className="border-border flex flex-col gap-3 rounded-xs border p-5">
      <h2 className="font-semibold">Order Summary</h2>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatINR(subtotal)}</span>
      </div>
      {discount > 0 ? (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Discount ({appliedCoupon?.code})</span>
          <span className="text-brand">-{formatINR(discount)}</span>
        </div>
      ) : null}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Delivery</span>
        <span>{deliveryCharge === 0 ? "Free" : formatINR(deliveryCharge)}</span>
      </div>
      {deliveryCharge > 0 ? (
        <p className="text-muted-foreground text-xs">
          Free delivery on orders over {formatINR(FREE_DELIVERY_THRESHOLD)}. Midnight/express slots
          may add a surcharge, shown at checkout.
        </p>
      ) : null}
      <div className="flex justify-between border-t pt-3 text-base font-semibold">
        <span>Total</span>
        <span>{formatINR(total)}</span>
      </div>
      <Button
        variant="brand"
        size="lg"
        className="mt-2"
        nativeButton={false}
        render={<Link href="/checkout" />}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
}
