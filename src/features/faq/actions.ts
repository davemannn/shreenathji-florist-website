"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createFaqItem as createFaqItemRepo,
  deleteFaqItem as deleteFaqItemRepo,
  findFaqItemById,
  reorderFaqItems as reorderFaqItemsRepo,
  setFaqItemActive,
  updateFaqItem as updateFaqItemRepo,
} from "@/server/repositories/faq-item.repository";
import { faqItemFormSchema, type FaqItemFormValues } from "./validations";

export async function createFaqItemAction(input: FaqItemFormValues) {
  const session = await requireAdminCapability("faq:manage");
  const values = faqItemFormSchema.parse(input);
  const item = await createFaqItemRepo(values);

  await logAudit(session, {
    entityType: "FaqItem",
    entityId: item.id,
    entityLabel: values.question,
    action: "created",
    summary: "Added an FAQ",
  });

  revalidatePath("/admin/faqs");
  revalidatePath("/");
  revalidatePath("/faq");
  return { id: item.id };
}

export async function updateFaqItemAction(id: string, input: FaqItemFormValues) {
  const session = await requireAdminCapability("faq:manage");
  const values = faqItemFormSchema.parse(input);

  const before = await findFaqItemById(id);
  await updateFaqItemRepo(id, values);

  if (before) {
    const changes: string[] = [];
    if (before.question !== values.question) changes.push("Question updated");
    if (before.answer !== values.answer) changes.push("Answer updated");
    if (before.isActive !== values.isActive)
      changes.push(values.isActive ? "Reactivated" : "Deactivated");
    await logAudit(session, {
      entityType: "FaqItem",
      entityId: id,
      entityLabel: values.question,
      action: "updated",
      summary: changes.length > 0 ? changes.join("; ") : "Updated FAQ details",
    });
  }

  revalidatePath("/admin/faqs");
  revalidatePath(`/admin/faqs/${id}`);
  revalidatePath("/");
  revalidatePath("/faq");
}

export async function setFaqItemActiveAction(id: string, isActive: boolean) {
  const session = await requireAdminCapability("faq:manage");
  const item = await setFaqItemActive(id, isActive);

  await logAudit(session, {
    entityType: "FaqItem",
    entityId: id,
    entityLabel: item.question,
    action: isActive ? "restored" : "archived",
    summary: isActive ? "Shown again" : "Hidden",
  });

  revalidatePath("/admin/faqs");
  revalidatePath("/");
  revalidatePath("/faq");
}

export async function deleteFaqItemAction(id: string) {
  const session = await requireAdminCapability("faq:manage");
  const before = await findFaqItemById(id);
  await deleteFaqItemRepo(id);

  if (before) {
    await logAudit(session, {
      entityType: "FaqItem",
      entityId: id,
      entityLabel: before.question,
      action: "deleted",
      summary: "Permanently deleted",
    });
  }

  revalidatePath("/admin/faqs");
  revalidatePath("/");
  revalidatePath("/faq");
}

export async function reorderFaqItemsAction(orderedIds: string[]) {
  await requireAdminCapability("faq:manage");
  await reorderFaqItemsRepo(orderedIds);
  revalidatePath("/admin/faqs");
  revalidatePath("/");
  revalidatePath("/faq");
}
