"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/config";
import { createReminder, deleteReminder } from "@/server/repositories/reminder.repository";
import { createReminderSchema, type CreateReminderValues } from "./validations";

async function requireSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to save a reminder.");
  }
  return session.user;
}

export async function createReminderAction(input: CreateReminderValues) {
  const user = await requireSessionUser();
  const values = createReminderSchema.parse(input);

  await createReminder({ userId: user.id, ...values });
  revalidatePath("/account/reminders");
}

export async function deleteReminderAction(id: string) {
  const user = await requireSessionUser();
  await deleteReminder(id, user.id);
  revalidatePath("/account/reminders");
}
