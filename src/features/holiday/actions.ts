"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createHoliday,
  deleteHoliday,
  findHolidayById,
} from "@/server/repositories/holiday.repository";
import { holidayFormSchema, type HolidayFormValues } from "./validations";

export async function createHolidayAction(input: HolidayFormValues) {
  const session = await requireAdminCapability("settings:manage");
  const values = holidayFormSchema.parse(input);

  const holiday = await createHoliday({
    date: new Date(`${values.date}T00:00:00.000Z`),
    label: values.label,
    blocksAllDelivery: values.blocksAllDelivery,
  });

  await logAudit(session, {
    entityType: "Holiday",
    entityId: holiday.id,
    entityLabel: values.label,
    action: "created",
    summary: `${values.date} — ${values.blocksAllDelivery ? "fully closed" : "midnight delivery blocked"}`,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  revalidatePath("/cart");
}

export async function deleteHolidayAction(id: string) {
  const session = await requireAdminCapability("settings:manage");
  const holiday = await findHolidayById(id);
  await deleteHoliday(id);

  if (holiday) {
    await logAudit(session, {
      entityType: "Holiday",
      entityId: id,
      entityLabel: holiday.label,
      action: "deleted",
      summary: "Removed",
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  revalidatePath("/cart");
}
