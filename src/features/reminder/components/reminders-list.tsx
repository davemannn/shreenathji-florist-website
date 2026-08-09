"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Cake, Heart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteReminderAction } from "../actions";
import type { Reminder } from "../types";

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

export function RemindersList({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(reminder: Reminder) {
    startTransition(async () => {
      try {
        await deleteReminderAction(reminder.id);
        toast.success("Reminder deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this reminder.");
      }
    });
  }

  if (reminders.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        No reminders saved yet — add a birthday or anniversary so you never miss one.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {reminders.map((reminder) => {
        const Icon = OCCASION_ICON[reminder.occasion];
        return (
          <li
            key={reminder.id}
            className="border-border flex items-center gap-3 rounded-xs border p-4"
          >
            <div className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{reminder.recipientName}</p>
              <p className="text-muted-foreground text-xs">
                {MONTH_LABEL[reminder.month - 1]} {reminder.day}
                {reminder.note ? ` · ${reminder.note}` : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={() => handleDelete(reminder)}
              aria-label={`Delete reminder for ${reminder.recipientName}`}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
