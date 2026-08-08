import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listAuditLogEntityTypes, listAuditLogs } from "@/features/audit-log/queries";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { PAGE_SIZE_OPTIONS, parsePageSize } from "@/lib/pagination";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Audit Log",
};

const ACTION_VARIANT: Record<string, "secondary" | "outline" | "destructive"> = {
  created: "secondary",
  restored: "secondary",
  updated: "outline",
  archived: "outline",
  deleted: "destructive",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AuditLogPage({ searchParams }: PageProps<"/admin/audit-log">) {
  await requireAdminSession("reports:view");

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const entityType = typeof params.entityType === "string" ? params.entityType : undefined;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const pageSize = parsePageSize(params.pageSize);

  const [{ logs, total, pageSize: resolvedPageSize }, entityTypes] = await Promise.all([
    listAuditLogs({ search, entityType, page, pageSize }),
    listAuditLogEntityTypes(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-muted-foreground text-sm">
          {total} recorded changes — who changed what, and when.
        </p>
      </div>

      <SearchInput
        basePath="/admin/audit-log"
        search={search}
        placeholder="Search by item, summary, or staff name…"
        extraParams={{ entityType }}
      />

      <nav className="flex flex-wrap gap-1.5" aria-label="Filter by entity type">
        <Link
          href={`/admin/audit-log${search ? `?search=${search}` : ""}`}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            !entityType
              ? "border-brand bg-brand/10 text-brand"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          All
        </Link>
        {entityTypes.map((type) => {
          const qs = new URLSearchParams();
          qs.set("entityType", type);
          if (search) qs.set("search", search);
          return (
            <Link
              key={type}
              href={`/admin/audit-log?${qs}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                entityType === type
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {type}
            </Link>
          );
        })}
      </nav>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Who</TableHead>
            <TableHead>What</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground text-center">
                No matching activity.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell className="text-xs">
                  <div>{log.changedByName}</div>
                  <div className="text-muted-foreground">{log.changedByRole}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={ACTION_VARIANT[log.action] ?? "outline"}>{log.action}</Badge>{" "}
                  <span className="text-xs">
                    {log.entityType} &ldquo;{log.entityLabel}&rdquo;
                  </span>
                </TableCell>
                <TableCell className="max-w-md text-xs">{log.summary}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination
        basePath="/admin/audit-log"
        page={page}
        pageSize={resolvedPageSize}
        total={total}
        extraParams={{ search, entityType }}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
      />
    </div>
  );
}
