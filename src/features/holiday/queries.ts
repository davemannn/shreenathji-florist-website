import {
  listHolidays as listHolidaysRepo,
  listUpcomingHolidays,
} from "@/server/repositories/holiday.repository";
import { toIsoDate, type HolidayInfo } from "@/lib/delivery";
import type { AdminHoliday } from "./types";

export async function listHolidaysAdmin(): Promise<AdminHoliday[]> {
  const holidays = await listHolidaysRepo();
  return holidays.map((h) => ({
    id: h.id,
    date: toIsoDate(h.date),
    label: h.label,
    blocksAllDelivery: h.blocksAllDelivery,
  }));
}

/** Feeds lib/delivery.ts's isSlotAvailable — see checkout/page.tsx and cart/page.tsx. */
export async function getUpcomingHolidayInfos(): Promise<HolidayInfo[]> {
  const holidays = await listUpcomingHolidays();
  return holidays.map((h) => ({
    dateIso: toIsoDate(h.date),
    blocksAllDelivery: h.blocksAllDelivery,
  }));
}
