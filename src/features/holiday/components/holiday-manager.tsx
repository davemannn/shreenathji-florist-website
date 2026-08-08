"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createHolidayAction, deleteHolidayAction } from "../actions";
import type { AdminHoliday } from "../types";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HolidayManager({
  holidays,
  readOnly,
}: {
  holidays: AdminHoliday[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");
  const [blocksAll, setBlocksAll] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!date || !label.trim()) return;
    startTransition(async () => {
      try {
        await createHolidayAction({ date, label: label.trim(), blocksAllDelivery: blocksAll });
        setDate("");
        setLabel("");
        setBlocksAll(true);
        toast.success("Holiday added.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add this holiday.");
      }
    });
  }

  function handleDelete(holiday: AdminHoliday) {
    startTransition(async () => {
      try {
        await deleteHolidayAction(holiday.id);
        toast.success("Holiday removed.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't remove this holiday.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {holidays.length === 0 ? (
        <p className="text-muted-foreground text-xs">No holidays configured.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {holidays.map((holiday) => (
            <li
              key={holiday.id}
              className="border-border flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
            >
              <span>
                {formatDate(holiday.date)} — {holiday.label}{" "}
                <span className="text-muted-foreground text-xs">
                  ({holiday.blocksAllDelivery ? "fully closed" : "midnight blocked"})
                </span>
              </span>
              {!readOnly ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={isPending}
                  onClick={() => handleDelete(holiday)}
                  aria-label={`Remove ${holiday.label}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {!readOnly ? (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
            aria-label="Holiday date"
          />
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Diwali"
            className="w-40"
            aria-label="Holiday label"
          />
          <label className="flex items-center gap-1.5 pb-1.5 text-xs">
            <Checkbox checked={blocksAll} onCheckedChange={(c) => setBlocksAll(c === true)} />
            Fully closed
          </label>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isPending || !date || !label.trim()}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add
          </Button>
        </form>
      ) : null}
    </div>
  );
}
