"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  addCustomerTag,
  findUserById,
  removeCustomerTag,
} from "@/server/repositories/user.repository";
import { addCustomerTagSchema, type AddCustomerTagValues } from "./validations";

export async function addCustomerTagAction(userId: string, input: AddCustomerTagValues) {
  const session = await requireAdminCapability("customers:moderate");
  const values = addCustomerTagSchema.parse(input);

  await addCustomerTag(userId, values.label);

  const customer = await findUserById(userId);
  await logAudit(session, {
    entityType: "Customer",
    entityId: userId,
    entityLabel: customer?.name ?? userId,
    action: "updated",
    summary: `Tagged "${values.label}"`,
  });

  revalidatePath(`/admin/customers/${userId}`);
}

export async function removeCustomerTagAction(userId: string, tagId: string, label: string) {
  const session = await requireAdminCapability("customers:moderate");
  await removeCustomerTag(tagId);

  const customer = await findUserById(userId);
  await logAudit(session, {
    entityType: "Customer",
    entityId: userId,
    entityLabel: customer?.name ?? userId,
    action: "updated",
    summary: `Removed tag "${label}"`,
  });

  revalidatePath(`/admin/customers/${userId}`);
}
