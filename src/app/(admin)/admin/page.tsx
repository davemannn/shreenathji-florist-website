import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { can } from "@/server/auth/permissions";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

// Placeholder landing — real analytics (revenue trends, order volume, top
// products, delivery performance) is Phase 5 of the admin panel plan. This
// phase proves the RBAC gate, shell, and role-aware fallback routing work.
export default async function AdminDashboardPage() {
  const session = await requireAdminSession("analytics:view:operational");
  const seesFinancials = can(session.role, "analytics:view:financial");

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        Signed in as {session.name} ({session.email}).
      </p>
      <p className="text-muted-foreground mt-4 text-sm">
        Real analytics — revenue trends, order volume, top products, delivery performance — land in
        a later phase.{" "}
        {seesFinancials
          ? "You'll see full financial figures here."
          : "You'll see operational metrics here (no revenue/financial figures for your role)."}
      </p>
    </div>
  );
}
