"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { deleteCategoryAction } from "../actions";
import type { AdminCategory } from "../types";

export function CategoriesTable({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(category: AdminCategory) {
    if (category.productCount > 0) {
      toast.error(
        `Can't delete "${category.name}" — ${category.productCount} product${category.productCount === 1 ? "" : "s"} still use it.`,
      );
      return;
    }
    if (!window.confirm(`Delete "${category.name}"? This can't be undone.`)) return;

    startTransition(async () => {
      try {
        await deleteCategoryAction(category.id);
        toast.success("Category deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this category.");
      }
    });
  }

  if (categories.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No categories yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Products</TableHead>
          <TableHead>Flags</TableHead>
          <TableHead>Sort</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <ContentImage
                  src={category.imageUrl}
                  alt={category.name}
                  className="size-10 shrink-0 rounded-md"
                  sizes="40px"
                />
                <Link
                  href={`/admin/categories/${category.id}`}
                  className="text-brand font-medium hover:underline"
                >
                  {category.name}
                </Link>
              </div>
            </TableCell>
            <TableCell>{category.productCount}</TableCell>
            <TableCell className="flex gap-1">
              {category.isOccasion ? <Badge variant="secondary">Occasion</Badge> : null}
              {category.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
            </TableCell>
            <TableCell className="text-muted-foreground">{category.sortOrder}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/admin/categories/${category.id}`} />}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(category)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
