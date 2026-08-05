"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

interface AddToCartButtonProps {
  productTitle: string;
}

export function AddToCartButton({ productTitle }: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.add);

  return (
    <Button
      variant="brand"
      size="sm"
      className="w-full"
      onClick={() => {
        addToCart();
        toast.success(`${productTitle} added to cart`);
      }}
    >
      <ShoppingBag aria-hidden="true" />
      Add to Cart
    </Button>
  );
}
