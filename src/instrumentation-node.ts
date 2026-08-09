/**
 * The actual Node.js-only boot logic for instrumentation.ts, split into its
 * own file and reached only via a runtime-gated `require()` (not a
 * top-level `import`) — see that file's own doc comment for why both
 * things in here need to run at boot. Keeping the `node:child_process` /
 * `node:path` references out of instrumentation.ts itself avoids Next's
 * bundler flagging them as Edge-runtime-incompatible; this file is never
 * pulled into the Edge bundle at all, since the `require()` only executes
 * (and is only even reached) when NEXT_RUNTIME is "nodejs".
 */
import { execFileSync } from "node:child_process";
import path from "node:path";

const g = globalThis as unknown as {
  __migrationsApplied?: boolean;
  __reminderCronStarted?: boolean;
};

if (process.env.NODE_ENV === "production" && !g.__migrationsApplied) {
  g.__migrationsApplied = true;
  try {
    const prismaBin = path.join(process.cwd(), "node_modules", ".bin", "prisma");
    execFileSync(prismaBin, ["migrate", "deploy"], { stdio: "inherit" });
  } catch (error) {
    // Logged loudly but non-fatal: crashing the whole server here would
    // take down a site that might otherwise be serving fine (e.g. this
    // deploy added no new migrations, and the failure is some unrelated
    // transient DB hiccup). Any query that actually needs the missing
    // schema will fail with its own clear error either way — this is
    // just the one place with enough context to say "migrations" up
    // front instead of a confusing downstream Prisma error.
    console.error("[migrate] prisma migrate deploy failed at boot:", error);
  }
}

if (!g.__reminderCronStarted) {
  g.__reminderCronStarted = true;

  // Top-level await is fine here — this module is itself only ever reached
  // via a dynamic `await import()` from instrumentation.ts's register(),
  // which Next.js waits on before the server accepts requests.
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
