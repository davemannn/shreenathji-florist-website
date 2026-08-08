import {
  listAuditLogEntityTypes,
  listAuditLogs as listAuditLogsRepo,
  type ListAuditLogsParams,
} from "@/server/repositories/audit-log.repository";
import type { AuditLogEntry } from "./types";

export interface AuditLogListResult {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listAuditLogs(params: ListAuditLogsParams = {}): Promise<AuditLogListResult> {
  const { logs, total, page, pageSize } = await listAuditLogsRepo(params);
  return {
    logs: logs.map((log) => ({
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      entityLabel: log.entityLabel,
      action: log.action,
      summary: log.summary,
      changedByName: log.changedByName,
      changedByRole: log.changedByRole,
      createdAt: log.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
  };
}

export { listAuditLogEntityTypes };
