// Delivery-slot availability & dynamic-pricing rules — shared between the
// checkout UI (client-side preview) and order.service.ts (server-side
// source of truth), so the two can never disagree about what's bookable or
// what it costs.
//
// The store operates in a single timezone (IST, Vadodara) no matter where
// this code runs — a customer's browser or a server on UTC/whatever host
// timezone. Rather than pull in a timezone library for one fixed offset,
// "now" here is always computed as IST wall-clock time via a fixed
// UTC+5:30 shift applied to the real UTC epoch (`Date.now()`), then read
// back with the UTC getters. That keeps client and server agreeing on
// "what hour is it in Vadodara right now" regardless of host locale.

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/** IST "now" as a Date whose UTC getters return IST wall-clock values. */
export function nowInIst(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

/** `YYYY-MM-DD` for the given IST-shifted Date (or IST-now by default). */
export function toIsoDate(date: Date = nowInIst()): string {
  return date.toISOString().slice(0, 10);
}

export function todayIsoIst(): string {
  return toIsoDate(nowInIst());
}

export function tomorrowIsoIst(): string {
  const d = nowInIst();
  d.setUTCDate(d.getUTCDate() + 1);
  return toIsoDate(d);
}

/**
 * Fallback cutoff hour / charges (IST, 24h clock) — used only if a caller
 * doesn't pass the real configured value. The actual admin-configurable
 * values live in StoreSettings (features/settings) now; every real call
 * site (order.service.ts, checkout, cart, the marketing pages) fetches
 * those and passes them in explicitly. These consts just keep every other
 * caller (and any test calling these pure functions directly) working
 * with the pre-Settings behavior instead of silently going undefined.
 */
export const MIDNIGHT_CUTOFF_HOUR = 20; // 8 PM IST
export const EXPRESS_CHARGE = 99;
export const MIDNIGHT_CHARGE = 199;

export type DeliverySlotType = "NORMAL" | "FIXED" | "MIDNIGHT";

export function isSameDayIst(dateIso: string, now: Date = nowInIst()): boolean {
  return dateIso === toIsoDate(now);
}

export function isPastMidnightCutoff(
  now: Date = nowInIst(),
  cutoffHour: number = MIDNIGHT_CUTOFF_HOUR,
): boolean {
  return now.getUTCHours() >= cutoffHour;
}

export interface HolidayInfo {
  dateIso: string;
  /** true = closed entirely that day; false = only Midnight is blocked (see Holiday.blocksAllDelivery in schema.prisma). */
  blocksAllDelivery: boolean;
}

/** Whether a given slot type can be booked for the given delivery date. */
export function isSlotAvailable(
  type: DeliverySlotType,
  dateIso: string,
  now: Date = nowInIst(),
  cutoffHour: number = MIDNIGHT_CUTOFF_HOUR,
  holidays: HolidayInfo[] = [],
): boolean {
  const holiday = holidays.find((h) => h.dateIso === dateIso);
  if (holiday?.blocksAllDelivery) return false; // fully closed — no slot type bookable

  const sameDay = isSameDayIst(dateIso, now);
  if (type === "NORMAL") return !sameDay; // Standard: next day onward only
  if (type === "MIDNIGHT") {
    if (holiday) return false; // any holiday entry on this date blocks Midnight specifically
    return !sameDay || !isPastMidnightCutoff(now, cutoffHour); // today: only before cutoff
  }
  return true; // FIXED (Express/Instant): always available (unless fully closed, handled above)
}

/**
 * The surcharge actually charged for a slot — differs from the slot's own
 * stored `extraCharge` only for Express/Instant ordered same-day past the
 * midnight cutoff, since it effectively delivers as late as the Midnight
 * slot would and is priced accordingly.
 */
export function effectiveSlotCharge(
  type: DeliverySlotType,
  dateIso: string,
  baseCharge: number,
  now: Date = nowInIst(),
  cutoffHour: number = MIDNIGHT_CUTOFF_HOUR,
  midnightCharge: number = MIDNIGHT_CHARGE,
): number {
  if (type === "FIXED" && isSameDayIst(dateIso, now) && isPastMidnightCutoff(now, cutoffHour)) {
    return midnightCharge;
  }
  return baseCharge;
}

/** Display label for the Express/Instant slot, adjusted once it's carrying Midnight pricing. */
export function expressDisplayLabel(
  now: Date = nowInIst(),
  cutoffHour: number = MIDNIGHT_CUTOFF_HOUR,
): string {
  return isPastMidnightCutoff(now, cutoffHour)
    ? "Instant Delivery (arriving by midnight)"
    : "Instant Delivery (within 2-4 hours)";
}
