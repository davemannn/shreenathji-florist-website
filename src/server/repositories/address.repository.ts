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

export interface UpdateAddressInput {
  label?: string;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

/** Scoped by userId — never trust a client-supplied addressId alone before mutating. */
export async function updateAddress(addressId: string, userId: string, input: UpdateAddressInput) {
  return prisma.address.updateMany({ where: { id: addressId, userId }, data: input });
}

export async function deleteAddress(addressId: string, userId: string) {
  return prisma.address.deleteMany({ where: { id: addressId, userId } });
}

/** Clears any other default first so exactly one address stays default. */
export async function setDefaultAddress(addressId: string, userId: string) {
  await prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
  return prisma.address.updateMany({
    where: { id: addressId, userId },
    data: { isDefault: true },
  });
}
