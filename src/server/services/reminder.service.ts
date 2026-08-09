import { listRemindersDueOn } from "@/server/repositories/reminder.repository";
import { sendEmail } from "@/server/email/mailer";
import { ReminderEmail } from "@/emails/reminder-email";
import { getStoreSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";
import { nowInIst } from "@/lib/delivery";

const DAYS_AHEAD = 3;

const OCCASION_LABEL: Record<string, string> = {
  BIRTHDAY: "Birthday",
  ANNIVERSARY: "Anniversary",
  OTHER: "Reminder",
};

/**
 * Finds every reminder due in DAYS_AHEAD days and emails the customer.
 * Shared by the node-cron in-process scheduler (see instrumentation.ts) and
 * the /api/cron/send-reminders HTTP route (kept around as a manual-trigger
 * fallback — see that route's own doc comment). One failed send never
 * blocks the rest — best-effort per reminder.
 */
export async function sendDueReminderEmails(): Promise<{ checked: number; sent: number }> {
  const target = nowInIst();
  target.setUTCDate(target.getUTCDate() + DAYS_AHEAD);
  const month = target.getUTCMonth() + 1;
  const day = target.getUTCDate();

  const reminders = await listRemindersDueOn(month, day);
  const settings = await getStoreSettings();

  let sent = 0;
  for (const reminder of reminders) {
    try {
      await sendEmail({
        to: reminder.user.email,
        subject: `${reminder.recipientName}'s ${OCCASION_LABEL[reminder.occasion].toLowerCase()} is in ${DAYS_AHEAD} days`,
        react: ReminderEmail({
          customerName: reminder.user.name,
          occasionLabel: OCCASION_LABEL[reminder.occasion] ?? "Reminder",
          recipientName: reminder.recipientName,
          daysAhead: DAYS_AHEAD,
          shopUrl: `${siteConfig.url}/shop`,
          storeAddressLine: settings.registeredAddressLine,
          storeCity: settings.registeredCity,
          storePincode: settings.registeredPincode,
        }),
      });
      sent++;
    } catch {
      // Best-effort per-reminder — one failed send shouldn't block the rest.
    }
  }

  return { checked: reminders.length, sent };
}
