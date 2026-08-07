"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/shared/content-image";
import { formatINR } from "@/lib/format";
import { setProductActiveAction } from "../actions";
import type { AdminProductListItem } from "../types";

export function ProductsTable({ products }: { products: AdminProductListItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(id: string, nextActive: boolean) {
    startTransition(async () => {
      try {
        await setProductActiveAction(id, nextActive);
        toast.success(nextActive ? "Product activated." : "Product deactivated.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this product.");
      }
    });
  }

  if (products.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No products found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Categories</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <ContentImage
                  src={product.imageUrl}
                  alt={product.title}
                  className="size-10 shrink-0 rounded-md"
                  sizes="40px"
                />
                <div>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-brand font-medium hover:underline"
                  >
                    {product.title}
                  </Link>
                  {product.badge ? (
                    <Badge variant="secondary" className="ml-2">
                      {product.badge}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {product.categoryNames.join(", ") || "—"}
            </TableCell>
            <TableCell>{formatINR(product.minPrice)}</TableCell>
            <TableCell className={product.totalStock === 0 ? "text-destructive" : undefined}>
              {product.totalStock}
            </TableCell>
            <TableCell>
              <Badge variant={product.isActive ? "secondary" : "outline"}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/admin/products/${product.id}`} />}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggleActive(product.id, !product.isActive)}
                >
                  {product.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
