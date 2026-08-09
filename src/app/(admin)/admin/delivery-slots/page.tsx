import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listDeliverySlotsAdmin } from "@/features/delivery/queries";
import { DeliverySlotsTable } from "@/features/delivery/components/delivery-slots-table";
import { ReorderDeliverySlotsDialog } from "@/features/delivery/components/reorder-delivery-slots-dialog";
import { Button } from "@/components/ui/button";
import { getStoreSettings } from "@/features/settings/queries";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Delivery Slots",
};

export default async function AdminDeliverySlotsPage() {
  await requireAdminSession("delivery_slots:manage");
  const [slots, storeSettings] = await Promise.all([listDeliverySlotsAdmin(), getStoreSettings()]);

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

      <p className="bg-muted text-muted-foreground rounded-md p-3 text-xs">
        Each slot&rsquo;s charge below is added <em>on top of</em> the base delivery charge (
        {formatINR(storeSettings.baseDeliveryCharge)}, waived above{" "}
        {formatINR(storeSettings.freeDeliveryThreshold)} — set in{" "}
        <Link href="/admin/settings" className="text-brand underline underline-offset-2">
          Settings
        </Link>
        ). Whatever you set here is also exactly what customers see advertised on the Same Day /
        Midnight Delivery pages — there&rsquo;s no separate marketing price to update.
      </p>

      <DeliverySlotsTable slots={slots} />
    </div>
  );
}
