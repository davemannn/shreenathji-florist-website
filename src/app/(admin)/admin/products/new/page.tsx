import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listAllCategories } from "@/features/category/queries";
import { ProductForm } from "@/features/product/components/product-form";

export const metadata: Metadata = {
  title: "New Product",
};

export default async function NewProductPage() {
  await requireAdminSession("products:manage");
  const categories = await listAllCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
