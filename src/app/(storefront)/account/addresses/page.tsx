import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { listAddressesForUser } from "@/server/repositories/address.repository";
import { AddressList } from "@/features/account/components/address-list";
import type { AccountAddress } from "@/features/account/types";

export const metadata: Metadata = {
  title: "Saved Addresses",
};

export default async function AccountAddressesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in?redirectTo=/account/addresses");
  }

  const rows = await listAddressesForUser(session.user.id);
  const addresses: AccountAddress[] = rows.map((address) => ({
    id: address.id,
    label: address.label ?? undefined,
    recipientName: address.recipientName,
    recipientPhone: address.recipientPhone,
    line1: address.line1,
    line2: address.line2 ?? undefined,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    isDefault: address.isDefault,
  }));

  return <AddressList addresses={addresses} />;
}
