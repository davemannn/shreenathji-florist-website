"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setTeamMemberActiveAction, updateTeamMemberRoleAction } from "../actions";
import type { TeamMember } from "../types";
import type { AdminRole } from "@/server/auth/permissions";

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  store_manager: "Store Manager",
  delivery_guy: "Delivery Guy",
};

const SENIOR_ROLES: AdminRole[] = ["super_admin", "admin"];

interface TeamTableProps {
  members: TeamMember[];
  currentUserId: string;
  /** Whether the signed-in staff member can manage senior (admin/super_admin) accounts, or only junior ones. */
  canManageAll: boolean;
  assignableRoles: AdminRole[];
}

export function TeamTable({
  members,
  currentUserId,
  canManageAll,
  assignableRoles,
}: TeamTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(userId: string, role: AdminRole) {
    setPendingId(userId);
    startTransition(async () => {
      try {
        await updateTeamMemberRoleAction(userId, role);
        toast.success("Role updated.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update the role.");
      } finally {
        setPendingId(null);
      }
    });
  }

  function handleToggleActive(userId: string, nextActive: boolean) {
    setPendingId(userId);
    startTransition(async () => {
      try {
        await setTeamMemberActiveAction(userId, nextActive);
        toast.success(nextActive ? "Account reactivated." : "Account deactivated.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this account.");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const isSenior = SENIOR_ROLES.includes(member.role);
          const canEditThisRow = canManageAll || !isSenior;
          const isSelf = member.id === currentUserId;
          const rowPending = isPending && pendingId === member.id;

          return (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                {member.name} {isSelf ? <span className="text-muted-foreground">(you)</span> : null}
              </TableCell>
              <TableCell className="text-muted-foreground">{member.email}</TableCell>
              <TableCell>
                {canEditThisRow ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value as AdminRole)}
                    disabled={rowPending}
                  >
                    <SelectTrigger className="h-7 w-40">
                      <SelectValue>{(value: AdminRole) => ROLE_LABELS[value]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={member.banned ? "destructive" : "secondary"}>
                  {member.banned ? "Deactivated" : "Active"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {canEditThisRow && !isSelf ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={rowPending}
                    onClick={() => handleToggleActive(member.id, member.banned)}
                  >
                    {member.banned ? "Reactivate" : "Deactivate"}
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
