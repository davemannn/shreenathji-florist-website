"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { CartLineItemRow } from "./cart-line-item";
import { CartSummary } from "./cart-summary";
import { CouponInput } from "./coupon-input";

function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <ShoppingBag className="text-muted-foreground size-10" aria-hidden="true" />
      <div>
        <p className="font-medium">Your cart is empty</p>
        <p className="text-muted-foreground text-sm">Add something beautiful to get started.</p>
      </div>
      <Button variant="brand" nativeButton={false} render={<Link href="/shop" />}>
        Start Shopping
      </Button>
    </div>
  );
}

export function CartView() {
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const [hydrated, setHydrated] = useState(false);
  // Same hydration-safety pattern as useCartItemCount (src/stores/cart-store.ts)
  // — this whole page's content depends on localStorage-backed cart state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;
  if (items.length === 0) return <EmptyCart />;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <CartLineItemRow key={item.variantId} item={item} />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <CouponInput subtotal={subtotal} appliedCoupon={appliedCoupon} onApply={setCoupon} />
        <CartSummary subtotal={subtotal} appliedCoupon={appliedCoupon} />
      </div>
    </div>
  );
}
