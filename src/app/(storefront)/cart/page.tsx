import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";
import { getStoreSettings } from "@/features/settings/queries";

// getStoreSettings() reads the live DB. Without this, Next has no
// per-request signal on this route and would prerender it once at build
// time — baking in delivery-charge settings that can change from
// /admin/settings, and (the actual failure this fixes) requiring the build
// container to reach the production DB, which it can't — see the
// homepage's identical fix (page.tsx in this same route group) for the
// original diagnosis.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Cart",
};

export default async function CartPage() {
  const storeSettings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl md:text-4xl">Your Cart</h1>
      <CartView storeSettings={storeSettings} />
    </div>
  );
}
