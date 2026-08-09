"use client";

import { ReorderDialog } from "@/components/shared/reorder-dialog";
import { reorderFaqItemsAction } from "../actions";
import type { AdminFaqItem } from "../types";

export function ReorderFaqItemsDialog({ faqItems }: { faqItems: AdminFaqItem[] }) {
  return (
    <ReorderDialog
      items={faqItems}
      getId={(item) => item.id}
      renderRow={(item) => <span className="truncate">{item.question}</span>}
      onSave={reorderFaqItemsAction}
      title="Reorder FAQs"
      description="Drag rows into place, or use the arrows. This is the order they appear on the homepage and /faq page."
    />
  );
}
