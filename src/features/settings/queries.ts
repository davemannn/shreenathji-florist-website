import { cache } from "react";
import { getStoreSettings as getStoreSettingsRepo } from "@/server/repositories/store-settings.repository";
import type { StoreSettings } from "./types";

/**
 * `cache()` de-dupes this across every call within one request tree — the
 * checkout page, order.service.ts, and any other server component that
 * needs pricing settings in the same request only ever pay for the lookup
 * once. Same pattern as getSession() in require-admin.ts.
 */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  const row = await getStoreSettingsRepo();
  return {
    baseDeliveryCharge: row.baseDeliveryCharge,
    freeDeliveryThreshold: row.freeDeliveryThreshold,
    midnightCutoffHour: row.midnightCutoffHour,
    storeLatitude: row.storeLatitude ?? undefined,
    storeLongitude: row.storeLongitude ?? undefined,
    deliveryRadiusKm: row.deliveryRadiusKm,
    gstin: row.gstin ?? undefined,
    legalBusinessName: row.legalBusinessName ?? undefined,
    registeredAddressLine: row.registeredAddressLine ?? undefined,
    registeredCity: row.registeredCity ?? undefined,
    registeredState: row.registeredState,
    registeredPincode: row.registeredPincode ?? undefined,
    defaultGstRate: row.defaultGstRate,
    invoicePrefix: row.invoicePrefix,
    codEnabled: row.codEnabled,
    razorpayEnabled: row.razorpayEnabled,
  };
});
