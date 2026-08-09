import { prisma } from "@/server/db/prisma";

/** Active items only, in display order — what the homepage carousel actually shows. */
export async function listActiveTestimonials() {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/** Every item regardless of active state — the admin management list. */
export async function listTestimonialsAdmin() {
  return prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
}

export interface UpsertTestimonialInput {
  authorName: string;
  quote: string;
  rating: number;
  photoUrl?: string;
  isActive: boolean;
}

/** New testimonials land at the end of the display order — reordered visually afterwards, same pattern as delivery slots/categories. */
export async function createTestimonial(input: UpsertTestimonialInput) {
  const last = await prisma.testimonial.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.testimonial.create({
    data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
}

export async function updateTestimonial(id: string, input: UpsertTestimonialInput) {
  return prisma.testimonial.update({ where: { id }, data: input });
}

export async function findTestimonialById(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export async function setTestimonialActive(id: string, isActive: boolean) {
  return prisma.testimonial.update({ where: { id }, data: { isActive } });
}

export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({ where: { id } });
}

export async function reorderTestimonials(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.testimonial.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
}
