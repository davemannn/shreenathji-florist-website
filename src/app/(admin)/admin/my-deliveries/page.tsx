import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";

export const metadata: Metadata = {
  title: "My Deliveries",
};

// Delivery guy's dedicated, mobile-first surface — a genuinely separate
// route from /admin/orders (not the same table with conditional
// rendering), per the admin panel plan. Real content (assigned-order list,
// one-tap status updates) is Phase 2; this proves the route + gate exist
// so delivery_guy has somewhere real to land.
export default async function MyDeliveriesPage() {
  const session = await requireAdminSession("orders:view:assigned");

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">My Deliveries</h1>
      <p className="text-muted-foreground text-sm">Signed in as {session.name}.</p>
      <p className="text-muted-foreground mt-4 text-sm">
        Your assigned orders and one-tap delivery status updates land here in a later phase.
      </p>
    </div>
  );
}
