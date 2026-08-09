export type ReminderOccasion = "BIRTHDAY" | "ANNIVERSARY" | "OTHER";

export interface Reminder {
  id: string;
  occasion: ReminderOccasion;
  recipientName: string;
  month: number;
  day: number;
  note?: string;
}

/** /admin/reminders — so staff can reach out personally ahead of the date. */
export interface AdminReminderListItem {
  id: string;
  occasion: ReminderOccasion;
  recipientName: string;
  month: number;
  day: number;
  note?: string;
  /** Days from today to the next occurrence (wraps to next year), for sorting. */
  daysUntil: number;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}
