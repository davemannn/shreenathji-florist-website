import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getDeliverySlotForEdit } from "@/features/delivery/queries";
import { DeliverySlotForm } from "@/features/delivery/components/delivery-slot-form";

export const metadata: Metadata = {
  title: "Edit Delivery Slot",
};

export default async function EditDeliverySlotPage({
  params,
}: PageProps<"/admin/delivery-slots/[id]">) {
  const { id } = await params;
  await requireAdminSession("delivery_slots:manage");

  const slot = await getDeliverySlotForEdit(id);
  if (!slot) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Delivery Slot</h1>
      <DeliverySlotForm slot={slot} />
    </div>
  );
}
