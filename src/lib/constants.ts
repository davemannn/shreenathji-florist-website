// Cross-cutting constants (non-secret). Client- and server-safe — anything
// a Client Component needs to preview (e.g. a delivery-charge estimate on
// the cart page) has to live here rather than in a server-only file.

// No DeliveryZone/pincode-based pricing table for this pass (see the
// commerce-milestone plan) — flat charge + free-delivery threshold, plus
// each DeliverySlot's own extraCharge (e.g. midnight delivery costs more).
//
// These two are now admin-configurable via StoreSettings (features/settings)
// — every real pricing call site (order.service.ts, checkout, cart) fetches
// the live values and passes them in rather than importing these directly.
// They're kept as the fallback default (and as StoreSettings' own DB column
// defaults) for anything that doesn't.
export const BASE_DELIVERY_CHARGE = 49;
export const FREE_DELIVERY_THRESHOLD = 999;
