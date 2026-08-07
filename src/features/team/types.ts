import type { AdminRole } from "@/server/auth/permissions";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  banned: boolean;
  createdAt: string;
}
