import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";
import { getStoreSettings } from "@/features/settings/queries";

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
