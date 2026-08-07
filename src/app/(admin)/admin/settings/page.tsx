import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { can } from "@/server/auth/permissions";
import { getStoreSettings } from "@/features/settings/queries";
import { StoreSettingsForm } from "@/features/settings/components/store-settings-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const session = await requireAdminSession("settings:view");
  const canManage = can(session.role, "settings:manage");
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Delivery pricing used across the storefront.
        </p>
      </div>

      <StoreSettingsForm settings={settings} readOnly={!canManage} />
    </div>
  );
}
