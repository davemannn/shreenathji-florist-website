import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl md:text-4xl">Your Cart</h1>
      <CartView />
    </div>
  );
}
