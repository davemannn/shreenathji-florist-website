"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  getStoreSettings,
  updateStoreSettings as updateStoreSettingsRepo,
} from "@/server/repositories/store-settings.repository";
import { storeSettingsFormSchema, type StoreSettingsFormValues } from "./validations";

export async function updateStoreSettingsAction(input: StoreSettingsFormValues) {
  const session = await requireAdminCapability("settings:manage");
  const values = storeSettingsFormSchema.parse(input);

  const before = await getStoreSettings();
  await updateStoreSettingsRepo({
    ...values,
    gstin: values.gstin || null,
    legalBusinessName: values.legalBusinessName || null,
    registeredAddressLine: values.registeredAddressLine || null,
    registeredCity: values.registeredCity || null,
    registeredPincode: values.registeredPincode || null,
  });

  const changes: string[] = [];
  if (before.baseDeliveryCharge !== values.baseDeliveryCharge) {
    changes.push(
      `Base delivery charge ₹${before.baseDeliveryCharge} → ₹${values.baseDeliveryCharge}`,
    );
  }
  if (before.defaultGstRate !== values.defaultGstRate) {
    changes.push(`Default GST rate ${before.defaultGstRate}% → ${values.defaultGstRate}%`);
  }
  if ((before.gstin ?? "") !== (values.gstin ?? "")) changes.push("GSTIN changed");
  await logAudit(session, {
    entityType: "StoreSettings",
    entityId: "singleton",
    entityLabel: "Store Settings",
    action: "updated",
    summary: changes.length > 0 ? changes.join("; ") : "Updated settings",
  });

  revalidatePath("/admin/settings");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/same-day-delivery");
  revalidatePath("/midnight-delivery");
}
