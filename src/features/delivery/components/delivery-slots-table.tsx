"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
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
import { deleteDeliverySlotAction } from "../actions";
import type { AdminDeliverySlot } from "../types";

const TYPE_LABEL: Record<AdminDeliverySlot["type"], string> = {
  NORMAL: "Standard",
  FIXED: "Express / Instant",
  MIDNIGHT: "Midnight",
};

export function DeliverySlotsTable({ slots }: { slots: AdminDeliverySlot[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(slot: AdminDeliverySlot) {
    if (!window.confirm(`Delete "${slot.label}"? This can't be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteDeliverySlotAction(slot.id);
        toast.success("Delivery slot deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this delivery slot.");
      }
    });
  }

  if (slots.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">No delivery slots yet.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Label</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Extra Charge</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {slots.map((slot) => (
          <TableRow key={slot.id}>
            <TableCell>
              <Link
                href={`/admin/delivery-slots/${slot.id}`}
                className="text-brand font-medium hover:underline"
              >
                {slot.label}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">{TYPE_LABEL[slot.type]}</TableCell>
            <TableCell>₹{slot.extraCharge}</TableCell>
            <TableCell>
              <Badge variant={slot.isActive ? "secondary" : "outline"}>
                {slot.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/admin/delivery-slots/${slot.id}`} />}
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(slot)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
