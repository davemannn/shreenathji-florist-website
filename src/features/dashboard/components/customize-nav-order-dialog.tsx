"use client";

import { Settings2 } from "lucide-react";
import { ReorderDialog } from "@/components/shared/reorder-dialog";
import { adminNav, sortByPersonalOrder, type AdminNavItem } from "@/config/admin-navigation";
import { can, type AdminRole } from "@/server/auth/permissions";
import { updateAdminNavOrderAction } from "../actions";

/**
 * Lets any staff member drag-reorder their own admin sidebar — purely
 * personal, never affects which items another role can see (see
 * updateAdminNavOrderAction's own doc comment). Reuses the same
 * ReorderDialog used for e.g. testimonials/FAQ ordering, just with a
 * custom trigger button styled to sit in the sidebar rather than a page
 * header.
 */
export function CustomizeNavOrderDialog({ role, order }: { role: AdminRole; order?: string[] }) {
  const visible = adminNav.filter((item) => !item.capability || can(role, item.capability));
  const items = sortByPersonalOrder(visible, order);

  async function handleSave(orderedIds: string[]) {
    await updateAdminNavOrderAction(orderedIds);
  }

  return (
    <ReorderDialog<AdminNavItem>
      items={items}
      getId={(item) => item.href}
      renderRow={(item) => (
        <span className="inline-flex items-center gap-2">
          <item.icon className="size-3.5 shrink-0" aria-hidden="true" />
          {item.label}
        </span>
      )}
      onSave={handleSave}
      title="Customize your sidebar"
      description="Drag items into the order you want, or use the arrows — this is just for you, it doesn't change what anyone else sees."
      triggerLabel="Customize"
      triggerIcon={Settings2}
      triggerClassName="w-full justify-start text-muted-foreground"
    />
  );
}
