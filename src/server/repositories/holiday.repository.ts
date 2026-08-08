import { prisma } from "@/server/db/prisma";

export async function listHolidays() {
  return prisma.holiday.findMany({ orderBy: { date: "asc" } });
}

/** Today or later — past holidays are irrelevant to any availability check. */
export async function listUpcomingHolidays() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return prisma.holiday.findMany({ where: { date: { gte: today } }, orderBy: { date: "asc" } });
}

export interface CreateHolidayInput {
  date: Date;
  label: string;
  blocksAllDelivery: boolean;
}

export async function createHoliday(input: CreateHolidayInput) {
  return prisma.holiday.create({ data: input });
}

export async function findHolidayById(id: string) {
  return prisma.holiday.findUnique({ where: { id } });
}

export async function deleteHoliday(id: string) {
  return prisma.holiday.delete({ where: { id } });
}
