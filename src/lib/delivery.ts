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
 * Cutoff hour (IST, 24h clock) after which same-day Midnight-slot booking
 * closes, and Express/Instant delivery starts carrying Midnight pricing
 * instead — fulfilling "within 2-4 hours" past this point means arriving
 * close to midnight anyway. Hardcoded for now; move to an admin-configurable
 * setting once the admin panel supports it.
 */
export const MIDNIGHT_CUTOFF_HOUR = 20; // 8 PM IST

export const EXPRESS_CHARGE = 99;
export const MIDNIGHT_CHARGE = 199;

export type DeliverySlotType = "NORMAL" | "FIXED" | "MIDNIGHT";

export function isSameDayIst(dateIso: string, now: Date = nowInIst()): boolean {
  return dateIso === toIsoDate(now);
}

export function isPastMidnightCutoff(now: Date = nowInIst()): boolean {
  return now.getUTCHours() >= MIDNIGHT_CUTOFF_HOUR;
}

/** Whether a given slot type can be booked for the given delivery date. */
export function isSlotAvailable(
  type: DeliverySlotType,
  dateIso: string,
  now: Date = nowInIst(),
): boolean {
  const sameDay = isSameDayIst(dateIso, now);
  if (type === "NORMAL") return !sameDay; // Standard: next day onward only
  if (type === "MIDNIGHT") return !sameDay || !isPastMidnightCutoff(now); // today: only before cutoff
  return true; // FIXED (Express/Instant): always available
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
): number {
  if (type === "FIXED" && isSameDayIst(dateIso, now) && isPastMidnightCutoff(now)) {
    return MIDNIGHT_CHARGE;
  }
  return baseCharge;
}

/** Display label for the Express/Instant slot, adjusted once it's carrying Midnight pricing. */
export function expressDisplayLabel(now: Date = nowInIst()): string {
  return isPastMidnightCutoff(now)
    ? "Instant Delivery (arriving by midnight)"
    : "Instant Delivery (within 2-4 hours)";
}
