"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Power, Trash2 } from "lucide-react";
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
import { formatINR } from "@/lib/format";
import { deleteSubscriptionPlanAction, setSubscriptionPlanActiveAction } from "../actions";
import type { AdminSubscriptionPlan } from "../types";

export function SubscriptionPlansTable({ plans }: { plans: AdminSubscriptionPlan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(plan: AdminSubscriptionPlan) {
    startTransition(async () => {
      try {
        await setSubscriptionPlanActiveAction(plan.id, !plan.isActive);
        toast.success(plan.isActive ? "Plan hidden." : "Plan shown.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this plan.");
      }
    });
  }

  function handleDelete(plan: AdminSubscriptionPlan) {
    if (!window.confirm(`Permanently delete "${plan.name}"? Consider deactivating instead.`))
      return;
    startTransition(async () => {
      try {
        await deleteSubscriptionPlanAction(plan.id);
        toast.success("Plan deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this plan.");
      }
    });
  }

  if (plans.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">No subscription plans yet.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Pricing</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell>
              <Link
                href={`/admin/subscriptions/plans/${plan.id}`}
                className="text-brand font-medium hover:underline"
              >
                {plan.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">{plan.category}</TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {plan.intervals.length === 0
                ? "No pricing set"
                : plan.intervals
                    .map((i) => `${i.interval.toLowerCase()}: ${formatINR(i.price)}`)
                    .join(" · ")}
            </TableCell>
            <TableCell>
              <Badge variant={plan.isActive ? "secondary" : "outline"}>
                {plan.isActive ? "Active" : "Hidden"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/admin/subscriptions/plans/${plan.id}`} />}
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggleActive(plan)}
                >
                  <Power className="size-3.5" aria-hidden="true" />
                  {plan.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(plan)}
                  aria-label={`Permanently delete ${plan.name}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
