import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { DeliverySlotForm } from "@/features/delivery/components/delivery-slot-form";

export const metadata: Metadata = {
  title: "New Delivery Slot",
};

export default async function NewDeliverySlotPage() {
  await requireAdminSession("delivery_slots:manage");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Delivery Slot</h1>
      <DeliverySlotForm />
    </div>
  );
}
