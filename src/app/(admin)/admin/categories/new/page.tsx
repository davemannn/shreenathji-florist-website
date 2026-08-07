import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { CategoryForm } from "@/features/category/components/category-form";

export const metadata: Metadata = {
  title: "New Category",
};

export default async function NewCategoryPage() {
  await requireAdminSession("categories:manage");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Category</h1>
      <CategoryForm />
    </div>
  );
}
