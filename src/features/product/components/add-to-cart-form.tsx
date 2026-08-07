"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/shared/content-image";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { useVariantSelection } from "./variant-selection-context";
import type { ProductDetail } from "../types";

export function AddToCartForm({ product }: { product: ProductDetail }) {
  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const { variantId, setVariantId } = useVariantSelection();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const variant = product.variants.find((v) => v.id === variantId) ?? defaultVariant;
  const outOfStock = !variant || variant.stock <= 0;

  function handleAddToCart() {
    if (!variant) return;
    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        variantId: variant.id,
        productTitle: product.title,
        variantLabel: variant.label,
        imageUrl: variant.imageUrl ?? product.imageUrl,
        price: variant.price,
      },
      quantity,
    );
    toast.success(`${product.title} (${variant.label}) added to cart`);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="flex items-baseline gap-2 text-2xl font-semibold">
        {formatINR(variant?.price ?? 0)}
        {variant?.compareAtPrice ? (
          <span className="text-muted-foreground text-base font-normal line-through">
            {formatINR(variant.compareAtPrice)}
          </span>
        ) : null}
      </p>

      {product.variants.length > 1 ? (
        <div>
          <p className="mb-2 text-sm font-medium">Size / Option</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                disabled={v.stock <= 0}
                className={cn(
                  "flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40",
                  !v.imageUrl && "pl-4",
                  v.id === variantId
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border hover:bg-muted",
                )}
              >
                {v.imageUrl ? (
                  <ContentImage
                    src={v.imageUrl}
                    alt=""
                    className="size-6 shrink-0 rounded-full"
                    sizes="24px"
                  />
                ) : null}
                {v.label}
                {v.stock <= 0 ? " (Out of stock)" : ""}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <div className="border-border flex items-center rounded-full border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="hover:bg-muted flex size-9 items-center justify-center rounded-full"
          >
            <Minus className="size-3.5" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="hover:bg-muted flex size-9 items-center justify-center rounded-full"
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </button>
        </div>
        <Button
          variant="brand"
          size="lg"
          className="flex-1"
          disabled={outOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingBag aria-hidden="true" />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
