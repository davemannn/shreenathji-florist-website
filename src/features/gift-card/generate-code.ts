/**
 * `GC-XXXXXXXX` — simple and readable enough to read aloud over a phone
 * call. Split out of actions.ts (a "use server" file, where every export
 * must itself be an async server action) so both the storefront purchase
 * flow and the admin manual-issue flow can share it.
 */
export function generateGiftCardCode(): string {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `GC-${random}`;
}
