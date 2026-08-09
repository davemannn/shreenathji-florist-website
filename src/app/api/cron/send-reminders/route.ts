import { NextResponse } from "next/server";
import { sendDueReminderEmails } from "@/server/services/reminder.service";

/**
 * Manual-trigger fallback for the reminder email sweep. The actual daily
 * send now runs in-process via node-cron (see instrumentation.ts) — this
 * route exists so an admin (or an external monitor) can force a run on
 * demand, or as a working fallback if this deployment ever moves to a
 * platform that doesn't keep a single long-lived Node process alive (the
 * in-process scheduler below assumes `next start` stays running, which is
 * how this app is actually deployed — see package.json's "start" script).
 *
 * Gated by CRON_SECRET (Authorization: Bearer <secret>) so this can't be
 * hit by anyone who finds the URL and spam-triggers emails.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendDueReminderEmails();
  return NextResponse.json(result);
}
