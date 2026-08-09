"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createTestimonial as createTestimonialRepo,
  deleteTestimonial as deleteTestimonialRepo,
  findTestimonialById,
  reorderTestimonials as reorderTestimonialsRepo,
  setTestimonialActive,
  updateTestimonial as updateTestimonialRepo,
} from "@/server/repositories/testimonial.repository";
import { testimonialFormSchema, type TestimonialFormValues } from "./validations";

export async function createTestimonialAction(input: TestimonialFormValues) {
  const session = await requireAdminCapability("testimonials:manage");
  const values = testimonialFormSchema.parse(input);
  const testimonial = await createTestimonialRepo(values);

  await logAudit(session, {
    entityType: "Testimonial",
    entityId: testimonial.id,
    entityLabel: values.authorName,
    action: "created",
    summary: "Added a testimonial",
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { id: testimonial.id };
}

export async function updateTestimonialAction(id: string, input: TestimonialFormValues) {
  const session = await requireAdminCapability("testimonials:manage");
  const values = testimonialFormSchema.parse(input);

  const before = await findTestimonialById(id);
  await updateTestimonialRepo(id, values);

  if (before) {
    const changes: string[] = [];
    if (before.quote !== values.quote) changes.push("Quote updated");
    if (before.rating !== values.rating) changes.push(`Rating ${before.rating} → ${values.rating}`);
    if (before.isActive !== values.isActive)
      changes.push(values.isActive ? "Reactivated" : "Deactivated");
    await logAudit(session, {
      entityType: "Testimonial",
      entityId: id,
      entityLabel: values.authorName,
      action: "updated",
      summary: changes.length > 0 ? changes.join("; ") : "Updated testimonial details",
    });
  }

  revalidatePath("/admin/testimonials");
  revalidatePath(`/admin/testimonials/${id}`);
  revalidatePath("/");
}

export async function setTestimonialActiveAction(id: string, isActive: boolean) {
  const session = await requireAdminCapability("testimonials:manage");
  const testimonial = await setTestimonialActive(id, isActive);

  await logAudit(session, {
    entityType: "Testimonial",
    entityId: id,
    entityLabel: testimonial.authorName,
    action: isActive ? "restored" : "archived",
    summary: isActive ? "Shown on the homepage again" : "Hidden from the homepage",
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonialAction(id: string) {
  const session = await requireAdminCapability("testimonials:manage");
  const before = await findTestimonialById(id);
  await deleteTestimonialRepo(id);

  if (before) {
    await logAudit(session, {
      entityType: "Testimonial",
      entityId: id,
      entityLabel: before.authorName,
      action: "deleted",
      summary: "Permanently deleted",
    });
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function reorderTestimonialsAction(orderedIds: string[]) {
  await requireAdminCapability("testimonials:manage");
  await reorderTestimonialsRepo(orderedIds);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
