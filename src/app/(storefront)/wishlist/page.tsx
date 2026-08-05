import type { Metadata } from "next";
import { WishlistView } from "@/features/wishlist/components/wishlist-view";

export const metadata: Metadata = {
  title: "Your Wishlist",
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl md:text-4xl">Your Wishlist</h1>
      <WishlistView />
    </div>
  );
}
