import { prisma } from "@/server/db/prisma";

/** Fixed id — StoreSettings is always exactly one row. Exported for order.repository.ts's invoice-numbering transaction. */
export const SINGLETON_ID = "singleton";

/** Upsert-on-read: creates the row with schema defaults the first time anything asks for it. */
export async function getStoreSettings() {
  return prisma.storeSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export interface UpdateStoreSettingsInput {
  baseDeliveryCharge: number;
  freeDeliveryThreshold: number;
  midnightCutoffHour: number;
  expressCharge: number;
  midnightCharge: number;
  // `| null` (not just optional) — Prisma's update input treats `undefined`
  // as "leave unchanged" but `null` as "clear it"; these fields need to be
  // clearable (e.g. removing a GSTIN), so callers must pass null explicitly
  // rather than omitting the key.
  gstin?: string | null;
  legalBusinessName?: string | null;
  registeredAddressLine?: string | null;
  registeredCity?: string | null;
  registeredState: string;
  registeredPincode?: string | null;
  defaultGstRate: number;
  invoicePrefix: string;
  codEnabled: boolean;
  razorpayEnabled: boolean;
}

export async function updateStoreSettings(input: UpdateStoreSettingsInput) {
  return prisma.storeSettings.upsert({
    where: { id: SINGLETON_ID },
    update: input,
    create: { id: SINGLETON_ID, ...input },
  });
}
