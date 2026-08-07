import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getProductForEdit } from "@/features/product/queries";
import { listAllCategories } from "@/features/category/queries";
import { ProductForm } from "@/features/product/components/product-form";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  await requireAdminSession("products:manage");

  const [product, categories] = await Promise.all([getProductForEdit(id), listAllCategories()]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
