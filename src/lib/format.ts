const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Formats whole-rupee amounts as "₹899" (no paise) using Indian digit grouping. */
export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}
