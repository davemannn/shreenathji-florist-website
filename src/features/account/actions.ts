"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "@/server/repositories/address.repository";
import { addressSchema, type AddressValues } from "./validations";

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in.");
  }
  return session.user.id;
}

export async function addAddressAction(input: AddressValues) {
  const userId = await requireUserId();
  const values = addressSchema.parse(input);
  await createAddress({ userId, ...values });
  revalidatePath("/account/addresses");
}

export async function updateAddressAction(addressId: string, input: AddressValues) {
  const userId = await requireUserId();
  const values = addressSchema.parse(input);
  await updateAddress(addressId, userId, values);
  revalidatePath("/account/addresses");
}

export async function deleteAddressAction(addressId: string) {
  const userId = await requireUserId();
  await deleteAddress(addressId, userId);
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(addressId: string) {
  const userId = await requireUserId();
  await setDefaultAddress(addressId, userId);
  revalidatePath("/account/addresses");
}
