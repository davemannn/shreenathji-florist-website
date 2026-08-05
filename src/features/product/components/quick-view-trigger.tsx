"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContentImage } from "@/components/shared/content-image";
import { AddToCartButton } from "./add-to-cart-button";
import { formatINR } from "@/lib/format";
import type { Product } from "../types";

export function QuickViewTrigger({ product }: { product: Product }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label={`Quick view ${product.title}`}
          />
        }
      >
        <Eye className="size-4" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>Quick view</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <ContentImage
            src={product.imageUrl}
            alt={product.imageAlt}
            className="aspect-square rounded-md"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
          <div className="flex flex-col gap-3">
            <p className="text-xl font-semibold">{formatINR(product.price)}</p>
            <AddToCartButton
              item={{
                productId: product.id,
                productSlug: product.slug,
                variantId: product.defaultVariantId,
                productTitle: product.title,
                variantLabel: product.defaultVariantLabel,
                imageUrl: product.imageUrl,
                price: product.price,
              }}
            />
            <Link
              href={`/shop/product/${product.slug}`}
              className="text-muted-foreground text-sm underline underline-offset-4"
            >
              View full details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
