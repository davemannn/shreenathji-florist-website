/**
 * Runs once when this Next.js server instance boots (see
 * node_modules/next/dist/docs/.../instrumentation.md) — used here purely as
 * a place to start an in-process cron schedule. This only makes sense
 * because this app is deployed as a single long-lived `next start` process
 * (see package.json's "start" script: "prisma migrate deploy && next
 * start"), not as short-lived serverless functions — a node-cron interval
 * only keeps firing for as long as the process that scheduled it is alive.
 *
 * Guarded to Node.js only (skipped on the Edge runtime, which can't run
 * node-cron) and against Turbopack/dev re-registration via a global flag,
 * since `register()` firing twice would schedule the same job twice and
 * double-send reminder emails.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const g = globalThis as unknown as { __reminderCronStarted?: boolean };
  if (g.__reminderCronStarted) return;
  g.__reminderCronStarted = true;

  const cron = await import("node-cron");
  const { sendDueReminderEmails } = await import("@/server/services/reminder.service");

  // Once a day at 8:00 AM IST — comfortably ahead of anyone's morning, and
  // reminders are for events 3 days out (see reminder.service.ts) so exact
  // timing isn't sensitive to the minute.
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        await sendDueReminderEmails();
      } catch (error) {
        // A scheduled tick failing outright (not just one reminder inside
        // it — that's already best-effort) should never crash the server.
        console.error("[reminder-cron] sweep failed:", error);
      }
    },
    { timezone: "Asia/Kolkata" },
  );
}
