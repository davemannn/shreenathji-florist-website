"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignDeliveryPersonAction } from "../actions";
import type { DeliveryPersonOption } from "../types";

const UNASSIGNED = "__unassigned__";

export function DeliveryAssignmentSelect({
  orderId,
  deliveryPersons,
  assignedId,
}: {
  orderId: string;
  deliveryPersons: DeliveryPersonOption[];
  assignedId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nameById = new Map(deliveryPersons.map((person) => [person.id, person.name]));

  function handleChange(value: string | null) {
    startTransition(async () => {
      try {
        await assignDeliveryPersonAction({
          orderId,
          deliveryPersonId: !value || value === UNASSIGNED ? null : value,
        });
        toast.success(value === UNASSIGNED ? "Unassigned." : "Delivery person assigned.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update the assignment.");
      }
    });
  }

  return (
    <Select value={assignedId ?? UNASSIGNED} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Unassigned">
          {(value: string) =>
            value === UNASSIGNED ? "Unassigned" : (nameById.get(value) ?? value)
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {deliveryPersons.map((person) => (
          <SelectItem key={person.id} value={person.id}>
            {person.name}
            {person.phone ? ` — ${person.phone}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
