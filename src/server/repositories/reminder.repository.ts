import { prisma } from "@/server/db/prisma";

export type ReminderOccasion = "BIRTHDAY" | "ANNIVERSARY" | "OTHER";

export async function listRemindersForUser(userId: string) {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: [{ month: "asc" }, { day: "asc" }],
  });
}

export interface CreateReminderInput {
  userId: string;
  occasion: ReminderOccasion;
  recipientName: string;
  month: number;
  day: number;
  note?: string;
}

export async function createReminder(input: CreateReminderInput) {
  return prisma.reminder.create({ data: input });
}

/** Scoped by userId — never trust a client-supplied id alone before deleting. */
export async function deleteReminder(id: string, userId: string) {
  return prisma.reminder.deleteMany({ where: { id, userId } });
}

/**
 * All active reminders whose (month, day) is exactly `daysAhead` days from
 * `today` — powers the cron-triggered send. Computed in JS (not a SQL date
 * calc) since month/day are stored as plain ints, not a real DATE column
 * (no year is ever meaningful here).
 */
export async function listRemindersDueOn(month: number, day: number) {
  return prisma.reminder.findMany({
    where: { isActive: true, month, day },
    include: { user: { select: { name: true, email: true } } },
  });
}

/**
 * Every active reminder across all customers, with enough contact info
 * for staff to reach out personally — /admin/reminders. Not paginated;
 * a single-city florist's reminder book is small enough to load in full,
 * same assumption already made for e.g. the coupons/testimonials lists.
 */
export async function listAllRemindersForAdmin() {
  return prisma.reminder.findMany({
    where: { isActive: true },
    orderBy: [{ month: "asc" }, { day: "asc" }],
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });
}
