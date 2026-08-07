import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listDeliverySlotsAdmin } from "@/features/delivery/queries";
import { DeliverySlotsTable } from "@/features/delivery/components/delivery-slots-table";
import { ReorderDeliverySlotsDialog } from "@/features/delivery/components/reorder-delivery-slots-dialog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Delivery Slots",
};

export default async function AdminDeliverySlotsPage() {
  await requireAdminSession("delivery_slots:manage");
  const slots = await listDeliverySlotsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Delivery Slots</h1>
          <p className="text-muted-foreground text-sm">{slots.length} slots</p>
        </div>
        <div className="flex items-center gap-2">
          <ReorderDeliverySlotsDialog slots={slots} />
          <Button
            variant="brand"
            nativeButton={false}
            render={<Link href="/admin/delivery-slots/new" />}
          >
            <Plus className="size-4" aria-hidden="true" />
            New Slot
          </Button>
        </div>
      </div>

      <DeliverySlotsTable slots={slots} />
    </div>
  );
}
