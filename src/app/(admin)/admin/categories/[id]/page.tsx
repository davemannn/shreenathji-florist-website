import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getCategoryForEdit } from "@/features/category/queries";
import { CategoryForm } from "@/features/category/components/category-form";

export const metadata: Metadata = {
  title: "Edit Category",
};

export default async function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;
  await requireAdminSession("categories:manage");

  const category = await getCategoryForEdit(id);
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Category</h1>
      <CategoryForm category={category} />
    </div>
  );
}
