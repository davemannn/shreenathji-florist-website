"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { updateStoreSettings as updateStoreSettingsRepo } from "@/server/repositories/store-settings.repository";
import { storeSettingsFormSchema, type StoreSettingsFormValues } from "./validations";

export async function updateStoreSettingsAction(input: StoreSettingsFormValues) {
  await requireAdminCapability("settings:manage");
  const values = storeSettingsFormSchema.parse(input);
  await updateStoreSettingsRepo(values);

  revalidatePath("/admin/settings");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/same-day-delivery");
  revalidatePath("/midnight-delivery");
}
