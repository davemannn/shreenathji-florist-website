export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  action: string;
  summary: string;
  changedByName: string;
  changedByRole: string;
  createdAt: string;
}
