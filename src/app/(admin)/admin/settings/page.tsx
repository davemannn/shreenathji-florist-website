import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { can } from "@/server/auth/permissions";
import { getStoreSettings } from "@/features/settings/queries";
import { StoreSettingsForm } from "@/features/settings/components/store-settings-form";
import { listHolidaysAdmin } from "@/features/holiday/queries";
import { HolidayManager } from "@/features/holiday/components/holiday-manager";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const session = await requireAdminSession("settings:view");
  const canManage = can(session.role, "settings:manage");
  const [settings, holidays] = await Promise.all([getStoreSettings(), listHolidaysAdmin()]);

  return (
    <div className="flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Delivery pricing used across the storefront.
        </p>
      </div>

      <StoreSettingsForm settings={settings} readOnly={!canManage} />

      <Separator />
      <div>
        <h2 className="text-sm font-semibold">Holidays</h2>
        <p className="text-muted-foreground text-xs">
          Blocks delivery booking on these dates — fully closed, or just Midnight delivery.
        </p>
      </div>
      <HolidayManager holidays={holidays} readOnly={!canManage} />
    </div>
  );
}
