"use client";

import { useRouter } from "next/navigation";
import { CreateTeamMemberDialog } from "./create-team-member-dialog";
import type { AdminRole } from "@/server/auth/permissions";

/** Thin client wrapper — CreateTeamMemberDialog is stateless w.r.t. the list, so refreshing after create lives here. */
export function CreateTeamMemberTrigger({ assignableRoles }: { assignableRoles: AdminRole[] }) {
  const router = useRouter();
  return (
    <CreateTeamMemberDialog assignableRoles={assignableRoles} onCreated={() => router.refresh()} />
  );
}
