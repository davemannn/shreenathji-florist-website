import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { listAddressesForUser } from "@/server/repositories/address.repository";
import { listActiveDeliverySlots } from "@/server/repositories/delivery-slot.repository";
import { findUserById } from "@/server/repositories/user.repository";
import { getStoreSettings } from "@/features/settings/queries";
import { getUpcomingHolidayInfos } from "@/features/holiday/queries";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in?redirectTo=/checkout");
  }

  const [addressRows, slotRows, storeSettings, holidays, user] = await Promise.all([
    listAddressesForUser(session.user.id),
    listActiveDeliverySlots(),
    getStoreSettings(),
    getUpcomingHolidayInfos(),
    findUserById(session.user.id),
  ]);

  const addresses = addressRows.map((address) => ({
    id: address.id,
    label: address.label ?? undefined,
    recipientName: address.recipientName,
    recipientPhone: address.recipientPhone,
    line1: address.line1,
    line2: address.line2 ?? undefined,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    latitude: address.latitude ?? undefined,
    longitude: address.longitude ?? undefined,
    isDefault: address.isDefault,
  }));

  const deliverySlots = slotRows.map((slot) => ({
    id: slot.id,
    label: slot.label,
    extraCharge: slot.extraCharge,
    type: slot.type,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl md:text-4xl">Checkout</h1>
      <CheckoutForm
        addresses={addresses}
        deliverySlots={deliverySlots}
        storeSettings={storeSettings}
        holidays={holidays}
        walletBalance={user?.walletBalance ?? 0}
      />
    </div>
  );
}
