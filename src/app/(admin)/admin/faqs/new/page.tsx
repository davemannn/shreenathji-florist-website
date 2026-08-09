import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { FaqItemForm } from "@/features/faq/components/faq-item-form";

export const metadata: Metadata = {
  title: "New FAQ",
};

export default async function NewFaqItemPage() {
  await requireAdminSession("faq:manage");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New FAQ</h1>
      <FaqItemForm />
    </div>
  );
}
