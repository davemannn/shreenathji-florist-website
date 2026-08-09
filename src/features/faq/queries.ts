import {
  findFaqItemById,
  listActiveFaqItems as listActiveFaqItemsRepo,
  listFaqItemsAdmin as listFaqItemsAdminRepo,
} from "@/server/repositories/faq-item.repository";
import type { AdminFaqItem, FaqItem } from "./types";

export async function getFaqs(): Promise<FaqItem[]> {
  const rows = await listActiveFaqItemsRepo();
  return rows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Admin panel.
// ---------------------------------------------------------------------------

function toAdminFaqItem(
  row: NonNullable<Awaited<ReturnType<typeof findFaqItemById>>>,
): AdminFaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category ?? undefined,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

export async function listFaqItemsAdmin(): Promise<AdminFaqItem[]> {
  const rows = await listFaqItemsAdminRepo();
  return rows.map(toAdminFaqItem);
}

export async function getFaqItemForEdit(id: string): Promise<AdminFaqItem | null> {
  const row = await findFaqItemById(id);
  return row ? toAdminFaqItem(row) : null;
}
