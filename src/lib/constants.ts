// Cross-cutting constants (non-secret). Client- and server-safe — anything
// a Client Component needs to preview (e.g. a delivery-charge estimate on
// the cart page) has to live here rather than in a server-only file.

// No DeliveryZone/pincode-based pricing table for this pass (see the
// commerce-milestone plan) — flat charge + free-delivery threshold, plus
// each DeliverySlot's own extraCharge (e.g. midnight delivery costs more).
export const BASE_DELIVERY_CHARGE = 49;
export const FREE_DELIVERY_THRESHOLD = 999;
