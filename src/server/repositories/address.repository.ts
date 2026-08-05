import { prisma } from "@/server/db/prisma";

export async function listAddressesForUser(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export interface CreateAddressInput {
  userId: string;
  label?: string;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export async function createAddress(input: CreateAddressInput) {
  return prisma.address.create({ data: input });
}
