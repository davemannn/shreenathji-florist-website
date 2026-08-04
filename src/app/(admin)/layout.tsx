// Admin dashboard shell — PLACEHOLDER.
// This route group will be the full replacement for wp-admin: sidebar/topbar
// chrome, and — once the auth milestone lands — gated by role (admin/staff)
// via middleware.ts, not just visually separated. No admin pages exist yet.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
