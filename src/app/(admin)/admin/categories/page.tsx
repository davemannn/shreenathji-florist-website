import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listCategoriesAdmin } from "@/features/category/queries";
import { CategoriesTable } from "@/features/category/components/categories-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  await requireAdminSession("categories:manage");
  const categories = await listCategoriesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-muted-foreground text-sm">{categories.length} categories</p>
        </div>
        <Button variant="brand" nativeButton={false} render={<Link href="/admin/categories/new" />}>
          <Plus className="size-4" aria-hidden="true" />
          New Category
        </Button>
      </div>

      <CategoriesTable categories={categories} />
    </div>
  );
}
