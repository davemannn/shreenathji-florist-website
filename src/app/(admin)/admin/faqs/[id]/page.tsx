import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getFaqItemForEdit } from "@/features/faq/queries";
import { FaqItemForm } from "@/features/faq/components/faq-item-form";

export const metadata: Metadata = {
  title: "Edit FAQ",
};

export default async function EditFaqItemPage({ params }: PageProps<"/admin/faqs/[id]">) {
  const { id } = await params;
  await requireAdminSession("faq:manage");

  const faqItem = await getFaqItemForEdit(id);
  if (!faqItem) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit FAQ</h1>
      <FaqItemForm faqItem={faqItem} />
    </div>
  );
}
