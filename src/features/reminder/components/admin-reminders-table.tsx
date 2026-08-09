import Link from "next/link";
import { Cake, Heart, Bell, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AdminReminderListItem } from "../types";

const MONTH_LABEL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const OCCASION_ICON = { BIRTHDAY: Cake, ANNIVERSARY: Heart, OTHER: Bell };
const OCCASION_LABEL = { BIRTHDAY: "Birthday", ANNIVERSARY: "Anniversary", OTHER: "Other" };

function dueLabel(daysUntil: number): {
  text: string;
  variant: "default" | "outline" | "secondary";
} {
  if (daysUntil === 0) return { text: "Today", variant: "default" };
  if (daysUntil <= 3)
    return { text: `In ${daysUntil} day${daysUntil === 1 ? "" : "s"}`, variant: "default" };
  if (daysUntil <= 14) return { text: `In ${daysUntil} days`, variant: "secondary" };
  return { text: `In ${daysUntil} days`, variant: "outline" };
}

export function AdminRemindersTable({ reminders }: { reminders: AdminReminderListItem[] }) {
  if (reminders.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        No customer reminders saved yet.
      </p>
    );
  }

  return (
    <div className="border-border overflow-x-auto rounded-xs border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Occasion</th>
            <th className="px-4 py-3 font-medium">For</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Due</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Contact</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {reminders.map((reminder) => {
            const Icon = OCCASION_ICON[reminder.occasion];
            const due = dueLabel(reminder.daysUntil);
            return (
              <tr key={reminder.id} className="align-top">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="text-brand size-3.5" aria-hidden="true" />
                    {OCCASION_LABEL[reminder.occasion]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{reminder.recipientName}</p>
                  {reminder.note ? (
                    <p className="text-muted-foreground text-xs">{reminder.note}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {MONTH_LABEL[reminder.month - 1]} {reminder.day}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={due.variant}>{due.text}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${reminder.customer.id}`}
                    className="hover:text-brand font-medium underline-offset-2 hover:underline"
                  >
                    {reminder.customer.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
                    <a
                      href={`mailto:${reminder.customer.email}`}
                      className="hover:text-brand inline-flex items-center gap-1"
                    >
                      <Mail className="size-3" aria-hidden="true" />
                      {reminder.customer.email}
                    </a>
                    {reminder.customer.phone ? (
                      <a
                        href={`tel:${reminder.customer.phone}`}
                        className="hover:text-brand inline-flex items-center gap-1"
                      >
                        <Phone className="size-3" aria-hidden="true" />
                        {reminder.customer.phone}
                      </a>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
