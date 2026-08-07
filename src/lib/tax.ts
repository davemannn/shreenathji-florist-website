// GST (India) tax calculation — shared between order.service.ts (source of
// truth at order-confirmation time) and anywhere else that needs to preview
// or re-derive a tax breakdown (invoices, reports).
//
// Prices throughout this storefront are tax-INCLUSIVE (the price shown is
// the price paid — standard for Indian D2C retail, and required for
// consumer-facing MRP). Nothing here changes an order's total; these
// functions only back-calculate the CGST/SGST/IGST breakup already implied
// by that inclusive price, for invoice and reporting purposes.

export interface CategoryTaxInfo {
  isOccasion: boolean;
  gstRate: number | null;
  hsnCode: string | null;
}

export interface ResolvedProductTax {
  gstRate: number;
  hsnCode: string | null;
}

/**
 * A product can carry multiple categories (e.g. "Flowers" + "Birthday") —
 * only a Shop category (isOccasion: false) represents an actual product
 * type with a real HSN/GST classification; Occasion categories are a
 * cross-cutting tag and never tax-relevant. Picks the first Shop category
 * that has a rate configured; falls back to defaultGstRate (and no HSN)
 * if the product has no such category, so nothing is silently taxed
 * incorrectly just because a category was missed.
 */
export function resolveProductTax(
  categories: CategoryTaxInfo[],
  defaultGstRate: number,
): ResolvedProductTax {
  const taxCategory = categories.find((c) => !c.isOccasion && c.gstRate !== null);
  if (taxCategory) {
    return { gstRate: taxCategory.gstRate!, hsnCode: taxCategory.hsnCode };
  }
  return { gstRate: defaultGstRate, hsnCode: null };
}

export interface TaxSplit {
  taxableValue: number;
  taxAmount: number;
}

/**
 * Back-calculates the taxable value and tax amount from a tax-INCLUSIVE
 * amount — e.g. ₹118 at 18% GST is ₹100 taxable + ₹18 tax, not ₹118 + ₹21.24.
 * Rounded to the nearest rupee (whole-rupee Int money throughout this app).
 */
export function splitInclusiveTax(amountInclusive: number, ratePercent: number): TaxSplit {
  if (ratePercent <= 0) return { taxableValue: amountInclusive, taxAmount: 0 };
  const taxableValue = Math.round((amountInclusive * 100) / (100 + ratePercent));
  return { taxableValue, taxAmount: amountInclusive - taxableValue };
}

export interface GstSplit {
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

/**
 * Same state as the seller's GST registration → CGST+SGST, split evenly
 * (any odd rupee from rounding goes to CGST). Different state → IGST for
 * the full amount, no CGST/SGST. See order.service.ts for how
 * `isInterState` itself is decided (compares delivery state to
 * StoreSettings.registeredState).
 */
export function splitGst(taxAmount: number, isInterState: boolean): GstSplit {
  if (isInterState) {
    return { cgstAmount: 0, sgstAmount: 0, igstAmount: taxAmount };
  }
  const sgstAmount = Math.floor(taxAmount / 2);
  const cgstAmount = taxAmount - sgstAmount;
  return { cgstAmount, sgstAmount, igstAmount: 0 };
}

/** Case/whitespace-insensitive — "Gujarat" vs "gujarat " should still match. */
export function isInterStateOrder(deliveryState: string, registeredState: string): boolean {
  return deliveryState.trim().toLowerCase() !== registeredState.trim().toLowerCase();
}

/** "SF/2526/000042" — Indian GST invoice series conventionally restart each financial year (Apr–Mar). */
export function formatInvoiceNumber(
  prefix: string,
  financialYear: string,
  sequence: number,
): string {
  return `${prefix}/${financialYear}/${String(sequence).padStart(6, "0")}`;
}

/** "2526" for FY 2025-26 (Apr 2025 – Mar 2026) — computed from IST wall-clock date. */
export function financialYearFor(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const startYear = month >= 4 ? year : year - 1;
  const endYear = (startYear + 1) % 100;
  return `${String(startYear % 100).padStart(2, "0")}${String(endYear).padStart(2, "0")}`;
}
