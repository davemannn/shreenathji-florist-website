import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listBannersAdmin } from "@/features/banner/queries";
import { BannersTable } from "@/features/banner/components/banners-table";
import { ReorderBannersDialog } from "@/features/banner/components/reorder-banners-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BannerType } from "@/features/banner/types";

export const metadata: Metadata = {
  title: "Banners",
};

const TABS: { value: BannerType; label: string }[] = [
  { value: "HERO", label: "Hero Slides" },
  { value: "PROMO", label: "Promo Tiles" },
  { value: "OCCASION", label: "Occasion Banner" },
];

export default async function AdminBannersPage({ searchParams }: PageProps<"/admin/banners">) {
  await requireAdminSession("banners:manage");

  const params = await searchParams;
  const type: BannerType = TABS.some((t) => t.value === params.type)
    ? (params.type as BannerType)
    : "HERO";

  const banners = await listBannersAdmin(type);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Banners</h1>
          <p className="text-muted-foreground text-sm">
            Homepage hero, promo tiles, and occasion banner — schedule a start/end date to run a
            time-limited offer without coming back to turn it off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReorderBannersDialog banners={banners} />
          <Button
            variant="brand"
            nativeButton={false}
            render={<Link href={`/admin/banners/new?type=${type}`} />}
          >
            <Plus className="size-4" aria-hidden="true" />
            New Banner
          </Button>
        </div>
      </div>

      <nav className="flex gap-1.5" aria-label="Banner placement">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/banners?type=${tab.value}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              type === tab.value
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <BannersTable banners={banners} type={type} />
    </div>
  );
}
