import {
  listRemindersForUser,
  listAllRemindersForAdmin,
} from "@/server/repositories/reminder.repository";
import { nowInIst } from "@/lib/delivery";
import type { AdminReminderListItem, Reminder } from "./types";

export async function getRemindersForUser(userId: string): Promise<Reminder[]> {
  const rows = await listRemindersForUser(userId);
  return rows.map((row) => ({
    id: row.id,
    occasion: row.occasion,
    recipientName: row.recipientName,
    month: row.month,
    day: row.day,
    note: row.note ?? undefined,
  }));
}

/** Days from today (IST) to the next (month, day) occurrence, wrapping to next year once it's passed. */
function daysUntilNextOccurrence(month: number, day: number): number {
  const today = nowInIst();
  today.setUTCHours(0, 0, 0, 0);
  let next = new Date(Date.UTC(today.getUTCFullYear(), month - 1, day));
  if (next < today) {
    next = new Date(Date.UTC(today.getUTCFullYear() + 1, month - 1, day));
  }
  return Math.round((next.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

/** /admin/reminders — soonest occasion first. */
export async function getAdminReminderList(): Promise<AdminReminderListItem[]> {
  const rows = await listAllRemindersForAdmin();
  return rows
    .map((row) => ({
      id: row.id,
      occasion: row.occasion,
      recipientName: row.recipientName,
      month: row.month,
      day: row.day,
      note: row.note ?? undefined,
      daysUntil: daysUntilNextOccurrence(row.month, row.day),
      customer: {
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        phone: row.user.phone ?? undefined,
      },
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
