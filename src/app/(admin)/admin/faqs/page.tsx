import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listFaqItemsAdmin } from "@/features/faq/queries";
import { FaqItemsTable } from "@/features/faq/components/faq-items-table";
import { ReorderFaqItemsDialog } from "@/features/faq/components/reorder-faq-items-dialog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQs",
};

export default async function AdminFaqsPage() {
  await requireAdminSession("faq:manage");
  const faqItems = await listFaqItemsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">FAQs</h1>
          <p className="text-muted-foreground text-sm">
            {faqItems.length} FAQs — shown on the homepage and the /faq page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReorderFaqItemsDialog faqItems={faqItems} />
          <Button variant="brand" nativeButton={false} render={<Link href="/admin/faqs/new" />}>
            <Plus className="size-4" aria-hidden="true" />
            New FAQ
          </Button>
        </div>
      </div>

      <FaqItemsTable faqItems={faqItems} />
    </div>
  );
}
