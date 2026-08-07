import { listStaff } from "@/server/repositories/team.repository";
import type { AdminRole } from "@/server/auth/permissions";
import type { TeamMember } from "./types";

export async function getTeamMembers(): Promise<TeamMember[]> {
  const rows = await listStaff();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    // Safe cast — listStaff() already filters role IN the admin-role list.
    role: row.role as AdminRole,
    banned: !!row.banned,
    createdAt: row.createdAt.toISOString(),
  }));
}
