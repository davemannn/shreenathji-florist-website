import { prisma } from "@/server/db/prisma";

/** Active items only, in display order — what the storefront (homepage accordion + /faq page) actually shows. */
export async function listActiveFaqItems() {
  return prisma.faqItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/** Every item regardless of active state — the admin management list. */
export async function listFaqItemsAdmin() {
  return prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
}

export interface UpsertFaqItemInput {
  question: string;
  answer: string;
  category?: string;
  isActive: boolean;
}

/** New items land at the end of the display order — reordered visually afterwards, same pattern as delivery slots/testimonials. */
export async function createFaqItem(input: UpsertFaqItemInput) {
  const last = await prisma.faqItem.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.faqItem.create({
    data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
}

export async function updateFaqItem(id: string, input: UpsertFaqItemInput) {
  return prisma.faqItem.update({ where: { id }, data: input });
}

export async function findFaqItemById(id: string) {
  return prisma.faqItem.findUnique({ where: { id } });
}

export async function setFaqItemActive(id: string, isActive: boolean) {
  return prisma.faqItem.update({ where: { id }, data: { isActive } });
}

export async function deleteFaqItem(id: string) {
  return prisma.faqItem.delete({ where: { id } });
}

export async function reorderFaqItems(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.faqItem.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
}
