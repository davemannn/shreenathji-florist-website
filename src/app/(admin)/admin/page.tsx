import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/server/auth/config";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

// Placeholder — proves role-gating works end to end. Real dashboard
// (orders, products, analytics, etc.) is its own future milestone.
export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6 lg:px-8">
      <h1 className="text-3xl">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Signed in as {session?.user.name} ({session?.user.email}). Real admin features — orders,
        products, inventory, analytics — land in a future milestone.
      </p>
    </div>
  );
}
