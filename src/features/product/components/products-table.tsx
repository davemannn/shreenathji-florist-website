"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Power } from "lucide-react";
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
import { SortableHeader } from "@/components/shared/sortable-header";
import { formatINR } from "@/lib/format";
import { setProductActiveAction } from "../actions";
import type { AdminProductListItem } from "../types";
import type { AdminProductSort } from "../queries";

interface ProductsTableProps {
  products: AdminProductListItem[];
  sort?: AdminProductSort;
  dir?: "asc" | "desc";
  search?: string;
}

export function ProductsTable({ products, sort, dir, search }: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const extraParams = { search };

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
          <SortableHeader
            basePath="/admin/products"
            label="Product"
            sortKey="title"
            currentSort={sort}
            currentDir={dir}
            extraParams={extraParams}
          />
          <TableHead>Categories</TableHead>
          <SortableHeader
            basePath="/admin/products"
            label="Price"
            sortKey="price"
            currentSort={sort}
            currentDir={dir}
            extraParams={extraParams}
          />
          <SortableHeader
            basePath="/admin/products"
            label="Stock"
            sortKey="stock"
            currentSort={sort}
            currentDir={dir}
            extraParams={extraParams}
          />
          <SortableHeader
            basePath="/admin/products"
            label="Status"
            sortKey="status"
            currentSort={sort}
            currentDir={dir}
            extraParams={extraParams}
          />
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
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggleActive(product.id, !product.isActive)}
                >
                  <Power className="size-3.5" aria-hidden="true" />
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
