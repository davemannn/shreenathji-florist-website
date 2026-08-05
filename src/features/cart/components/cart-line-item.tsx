"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { formatINR } from "@/lib/format";
import { ContentImage } from "@/components/shared/content-image";
import { useCartStore, type CartLineItem } from "@/stores/cart-store";

export function CartLineItemRow({ item }: { item: CartLineItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex gap-4 border-b pb-4">
      <Link href={`/shop/product/${item.productSlug}`} className="shrink-0">
        <ContentImage
          src={item.imageUrl}
          alt={item.productTitle}
          className="size-24 rounded-xs"
          sizes="96px"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/shop/product/${item.productSlug}`}
              className="text-sm font-medium hover:underline"
            >
              {item.productTitle}
            </Link>
            <p className="text-muted-foreground text-xs">{item.variantLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            aria-label={`Remove ${item.productTitle} from cart`}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="border-border flex items-center rounded-full border">
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="hover:bg-muted flex size-8 items-center justify-center rounded-full"
            >
              <Minus className="size-3" aria-hidden="true" />
            </button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              aria-label="Increase quantity"
              className="hover:bg-muted flex size-8 items-center justify-center rounded-full"
            >
              <Plus className="size-3" aria-hidden="true" />
            </button>
          </div>
          <span className="text-sm font-semibold">{formatINR(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  );
}
