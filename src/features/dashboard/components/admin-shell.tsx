"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut, User as UserIcon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { AdminRole } from "@/server/auth/permissions";
import { playOrderChime, unlockChimeAudio } from "@/lib/chime";
import { useOrderNotifications } from "../hooks/use-order-notifications";
import { AdminNavList } from "./admin-nav-list";
import { GlobalSearch } from "./global-search";

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  store_manager: "Store Manager",
  delivery_guy: "Delivery",
};

interface AdminShellProps {
  role: AdminRole;
  name: string;
  email: string;
  children: React.ReactNode;
}

export function AdminShell({ role, name, email, children }: AdminShellProps) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Mounted once for the whole admin shell (unlike the orders page's own
  // NewActivityBanner, which polls independently just for its banner) —
  // this is the one call site that actually plays the chime, so a new
  // order never gets announced twice.
  const { count } = useOrderNotifications(() => playOrderChime());
  const notificationsHref = role === "delivery_guy" ? "/admin/my-deliveries" : "/admin/orders";

  // Browsers suspend a freshly-created AudioContext until a user gesture
  // resumes it — the chime itself fires later from a background poll, not
  // a gesture, so without this the very first chime of the session could
  // be silently dropped. One-time listeners, self-removing.
  useEffect(() => {
    function unlock() {
      unlockChimeAudio();
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    }
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Desktop sidebar */}
      <aside className="bg-background fixed inset-y-0 left-0 hidden w-60 flex-col border-r lg:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin" className="font-heading text-lg">
            Shreenathji <span className="text-brand">Admin</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <AdminNavList role={role} />
        </div>
      </aside>

      {/* Mobile sheet nav */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b">
            <SheetTitle>
              Shreenathji <span className="text-brand">Admin</span>
            </SheetTitle>
          </SheetHeader>
          <div className="p-3">
            <AdminNavList role={role} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="bg-background sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu aria-hidden="true" />
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <GlobalSearch />
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Notifications, ${count} pending`}
              className="relative"
              nativeButton={false}
              render={<Link href={notificationsHref} />}
            >
              <Bell aria-hidden="true" />
              {count > 0 ? (
                <span className="bg-brand text-brand-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                  {count > 9 ? "9+" : count}
                </span>
              ) : null}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="gap-2" />}>
                <UserIcon className="size-4" aria-hidden="true" />
                <span className="max-w-32 truncate">{name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-foreground font-medium">{name}</span>
                    <span className="text-muted-foreground text-xs font-normal">{email}</span>
                    <span className="text-brand text-xs font-normal">{ROLE_LABELS[role]}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut aria-hidden="true" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
