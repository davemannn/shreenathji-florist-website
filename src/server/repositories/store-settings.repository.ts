import { prisma } from "@/server/db/prisma";

/** Fixed id — StoreSettings is always exactly one row. */
const SINGLETON_ID = "singleton";

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
}

export async function updateStoreSettings(input: UpdateStoreSettingsInput) {
  return prisma.storeSettings.upsert({
    where: { id: SINGLETON_ID },
    update: input,
    create: { id: SINGLETON_ID, ...input },
  });
}
