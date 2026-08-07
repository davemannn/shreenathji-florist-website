import { requireAdminSession } from "@/server/auth/require-admin";
import { AdminShell } from "@/features/dashboard/components/admin-shell";

// Real gate: any staff role (super_admin/admin/store_manager/delivery_guy)
// gets past this layout — the finer-grained "can this role actually do X"
// check happens per-page/per-action via requireAdminSession(capability)/
// requireAdminCapability(capability), not here. proxy.ts only fast-checks
// "is a session cookie present" before this ever runs.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <AdminShell role={session.role} name={session.name} email={session.email}>
      {children}
    </AdminShell>
  );
}
