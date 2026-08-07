import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { can, type AdminRole } from "@/server/auth/permissions";
import { getTeamMembers } from "@/features/team/queries";
import { TeamTable } from "@/features/team/components/team-table";
import { CreateTeamMemberTrigger } from "@/features/team/components/create-team-member-trigger";

export const metadata: Metadata = {
  title: "Team",
};

const ALL_ROLES: AdminRole[] = ["super_admin", "admin", "store_manager", "delivery_guy"];
const JUNIOR_ROLES: AdminRole[] = ["store_manager", "delivery_guy"];

export default async function TeamPage() {
  const session = await requireAdminSession("team:manage:junior");
  const canManageAll = can(session.role, "team:manage:all");
  const assignableRoles = canManageAll ? ALL_ROLES : JUNIOR_ROLES;

  const members = await getTeamMembers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-muted-foreground text-sm">
            {canManageAll
              ? "Manage every staff account and role."
              : "Manage Store Manager and Delivery Guy accounts."}
          </p>
        </div>
        <CreateTeamMemberTrigger assignableRoles={assignableRoles} />
      </div>

      <TeamTable
        members={members}
        currentUserId={session.userId}
        canManageAll={canManageAll}
        assignableRoles={assignableRoles}
      />
    </div>
  );
}
