import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";

// Admin dashboard shell — full sidebar/topbar chrome is a future milestone.
// This is the authoritative gate: proxy.ts only fast-checks "is a session
// cookie present," this does the real session + role lookup.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/sign-in?redirectTo=/admin");
  }

  return <>{children}</>;
}
