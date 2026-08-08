import { prisma } from "@/server/db/prisma";

export interface WriteAuditLogInput {
  entityType: string;
  entityId: string;
  entityLabel: string;
  action: string;
  summary: string;
  changedByUserId: string;
  changedByName: string;
  changedByRole: string;
}

export async function writeAuditLog(input: WriteAuditLogInput) {
  return prisma.auditLog.create({ data: input });
}

export async function listRecentAuditLogs(limit = 10) {
  return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export interface ListAuditLogsParams {
  entityType?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listAuditLogs(params: ListAuditLogsParams = {}) {
  const { entityType, search, page = 1, pageSize = 30 } = params;

  const where = {
    ...(entityType ? { entityType } : {}),
    ...(search
      ? {
          OR: [
            { entityLabel: { contains: search } },
            { summary: { contains: search } },
            { changedByName: { contains: search } },
          ],
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, pageSize };
}

/** Distinct entityType values seen so far — powers the audit log page's filter dropdown. */
export async function listAuditLogEntityTypes(): Promise<string[]> {
  const rows = await prisma.auditLog.findMany({
    distinct: ["entityType"],
    select: { entityType: true },
    orderBy: { entityType: "asc" },
  });
  return rows.map((r) => r.entityType);
}
