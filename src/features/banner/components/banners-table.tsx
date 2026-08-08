"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/shared/content-image";
import { deleteBannerAction, setBannerActiveAction } from "../actions";
import type { AdminBanner, BannerType } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Same window logic as banner.repository.ts's listActiveBannersByType — used here only to label rows, the DB query is still the source of truth for what's actually live. */
function scheduleStatus(banner: AdminBanner): "live" | "scheduled" | "expired" | "off" {
  if (!banner.isActive) return "off";
  const now = new Date();
  if (banner.startsAt && new Date(banner.startsAt) > now) return "scheduled";
  if (banner.endsAt && new Date(banner.endsAt) < now) return "expired";
  return "live";
}

const STATUS_LABEL: Record<ReturnType<typeof scheduleStatus>, string> = {
  live: "Live",
  scheduled: "Scheduled",
  expired: "Expired",
  off: "Off",
};

const STATUS_VARIANT: Record<
  ReturnType<typeof scheduleStatus>,
  "default" | "secondary" | "outline"
> = {
  live: "default",
  scheduled: "secondary",
  expired: "outline",
  off: "outline",
};

export function BannersTable({ banners, type }: { banners: AdminBanner[]; type: BannerType }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(banner: AdminBanner) {
    startTransition(async () => {
      try {
        await setBannerActiveAction(banner.id, !banner.isActive);
        toast.success(banner.isActive ? "Banner turned off." : "Banner turned on.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this banner.");
      }
    });
  }

  function handleDelete(banner: AdminBanner) {
    if (!window.confirm(`Permanently delete "${banner.headline}"? This can't be undone.`)) return;

    startTransition(async () => {
      try {
        await deleteBannerAction(banner.id);
        toast.success("Banner deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this banner.");
      }
    });
  }

  if (banners.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        No {type.toLowerCase()} banners yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Banner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {banners.map((banner) => {
          const status = scheduleStatus(banner);
          return (
            <TableRow key={banner.id} className={!banner.isActive ? "opacity-60" : undefined}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <ContentImage
                    src={banner.imageUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-md"
                    sizes="40px"
                  />
                  <Link
                    href={`/admin/banners/${banner.id}`}
                    className="text-brand font-medium hover:underline"
                  >
                    {banner.headline.split("\n")[0]}
                  </Link>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {banner.startsAt || banner.endsAt
                  ? `${banner.startsAt ? formatDate(banner.startsAt) : "Always"} → ${banner.endsAt ? formatDate(banner.endsAt) : "Always"}`
                  : "Always"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/admin/banners/${banner.id}`} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleToggleActive(banner)}
                  >
                    {banner.isActive ? (
                      <Archive className="size-3.5" aria-hidden="true" />
                    ) : (
                      <ArchiveRestore className="size-3.5" aria-hidden="true" />
                    )}
                    {banner.isActive ? "Turn off" : "Turn on"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => handleDelete(banner)}
                    aria-label={`Permanently delete ${banner.headline}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
