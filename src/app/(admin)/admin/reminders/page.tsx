import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getAdminReminderList } from "@/features/reminder/queries";
import { AdminRemindersTable } from "@/features/reminder/components/admin-reminders-table";

export const metadata: Metadata = {
  title: "Reminders",
};

export default async function AdminRemindersPage() {
  await requireAdminSession("customers:view");
  const reminders = await getAdminReminderList();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Customer Reminders</h1>
        <p className="text-muted-foreground text-sm">
          Birthdays and anniversaries customers have saved for themselves — sorted soonest first, so
          you can reach out personally (a call, a nudge email) ahead of the date. Automatic reminder
          emails also go out to the customer 3 days before, regardless.
        </p>
      </div>

      <AdminRemindersTable reminders={reminders} />
    </div>
  );
}
