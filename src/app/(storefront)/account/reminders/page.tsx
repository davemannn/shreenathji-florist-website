import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { getRemindersForUser } from "@/features/reminder/queries";
import { ReminderForm } from "@/features/reminder/components/reminder-form";
import { RemindersList } from "@/features/reminder/components/reminders-list";

export const metadata: Metadata = {
  title: "Your Reminders",
};

export default async function AccountRemindersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in?redirectTo=/account/reminders");
  }

  const reminders = await getRemindersForUser(session.user.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Save a birthday or anniversary and we&rsquo;ll email you a few days ahead — never miss
          another one.
        </p>
        <ReminderForm />
      </div>
      <RemindersList reminders={reminders} />
    </div>
  );
}
