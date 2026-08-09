import {
  findTestimonialById,
  listActiveTestimonials as listActiveTestimonialsRepo,
  listTestimonialsAdmin as listTestimonialsAdminRepo,
} from "@/server/repositories/testimonial.repository";
import type { AdminTestimonial, Testimonial } from "./types";

export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await listActiveTestimonialsRepo();
  return rows.map((row) => ({
    id: row.id,
    authorName: row.authorName,
    quote: row.quote,
    rating: row.rating,
    photoUrl: row.photoUrl ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Admin panel.
// ---------------------------------------------------------------------------

function toAdminTestimonial(
  row: NonNullable<Awaited<ReturnType<typeof findTestimonialById>>>,
): AdminTestimonial {
  return {
    id: row.id,
    authorName: row.authorName,
    quote: row.quote,
    rating: row.rating,
    photoUrl: row.photoUrl ?? undefined,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

export async function listTestimonialsAdmin(): Promise<AdminTestimonial[]> {
  const rows = await listTestimonialsAdminRepo();
  return rows.map(toAdminTestimonial);
}

export async function getTestimonialForEdit(id: string): Promise<AdminTestimonial | null> {
  const row = await findTestimonialById(id);
  return row ? toAdminTestimonial(row) : null;
}
