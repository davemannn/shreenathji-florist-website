/**
 * Site-wide pricing configuration — the DB-backed replacement for what used
 * to be hardcoded constants in src/lib/constants.ts / src/lib/delivery.ts.
 * Threaded as a prop into whichever client components price an order live
 * (cart/checkout previews) rather than imported as a static module, since
 * these values can now change at runtime via /admin/settings.
 */
export interface StoreSettings {
  baseDeliveryCharge: number;
  freeDeliveryThreshold: number;
  midnightCutoffHour: number;
  expressCharge: number;
  midnightCharge: number;
  /** Null until the business is GST-registered and this is set — see order.service.ts. */
  gstin?: string;
  legalBusinessName?: string;
  registeredAddressLine?: string;
  registeredCity?: string;
  registeredState: string;
  registeredPincode?: string;
  defaultGstRate: number;
  invoicePrefix: string;
  codEnabled: boolean;
  razorpayEnabled: boolean;
}
