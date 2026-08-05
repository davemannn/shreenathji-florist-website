"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartLineItem } from "@/stores/cart-store";

interface AddToCartButtonProps {
  item: Omit<CartLineItem, "quantity">;
  quantity?: number;
  className?: string;
}

export function AddToCartButton({ item, quantity = 1, className }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Button
      variant="brand"
      size="sm"
      className={className ?? "w-full"}
      onClick={() => {
        addItem(item, quantity);
        toast.success(`${item.productTitle} added to cart`);
      }}
    >
      <ShoppingBag aria-hidden="true" />
      Add to Cart
    </Button>
  );
}
