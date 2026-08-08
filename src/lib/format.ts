const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Formats whole-rupee amounts as "₹899" (no paise) using Indian digit grouping. */
export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

/**
 * Formats a date as "6 Aug 2026" — the same pattern several admin tables
 * previously each re-declared their own local `formatDate` for; centralized
 * here now that email templates need the same formatting server-side too.
 */
export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
