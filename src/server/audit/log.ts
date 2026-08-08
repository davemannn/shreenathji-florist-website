import { writeAuditLog } from "@/server/repositories/audit-log.repository";
import type { AdminSession } from "@/server/auth/require-admin";

export interface LogAuditInput {
  entityType: string;
  entityId: string;
  entityLabel: string;
  action: "created" | "updated" | "archived" | "restored" | "deleted";
  summary: string;
}

/**
 * Best-effort — writing the audit trail must never be the reason an actual
 * mutation fails. If this throws (DB hiccup, whatever), it's logged to the
 * server console and swallowed rather than surfaced to the admin as an
 * error on an action that otherwise succeeded.
 */
export async function logAudit(session: AdminSession, input: LogAuditInput) {
  try {
    await writeAuditLog({
      ...input,
      changedByUserId: session.userId,
      changedByName: session.name,
      changedByRole: session.role,
    });
  } catch (error) {
    console.error("Failed to write audit log entry", error);
  }
}
