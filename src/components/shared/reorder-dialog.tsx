"use client";

import { useState, useTransition, type ComponentType, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpDown, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReorderDialogProps<T> {
  items: T[];
  getId: (item: T) => string;
  /** Row content — usually a thumbnail + label, but left generic. */
  renderRow: (item: T) => ReactNode;
  onSave: (orderedIds: string[]) => Promise<void>;
  title: string;
  description: string;
  /** Defaults below match every existing call site (admin list-page toolbars) — only the sidebar's own reorder trigger overrides these. */
  triggerLabel?: string;
  triggerIcon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  triggerClassName?: string;
}

/**
 * Generic drag-and-drop reorder dialog — first built for admin categories,
 * generalized once delivery slots needed the identical UX (a list where the
 * display order is meaningful but a raw sortOrder number field is not
 * something admins should have to hand-edit). Drag rows into place (native
 * HTML5 drag-and-drop, no dependency) or use the ↑/↓ buttons as a
 * keyboard-friendly fallback for the same reorder.
 */
export function ReorderDialog<T>({
  items,
  getId,
  renderRow,
  onSave,
  title,
  description,
  triggerLabel = "Reorder",
  triggerIcon: TriggerIcon = ArrowUpDown,
  triggerClassName,
}: ReorderDialogProps<T>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setOrder(items); // start from the latest saved order every time it opens
    setOpen(nextOpen);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await onSave(order.map(getId));
        toast.success("Order updated.");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't save the new order.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" className={triggerClassName} />}>
        <TriggerIcon className="size-3.5" aria-hidden={true} />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto">
          {order.map((item, index) => {
            const id = getId(item);
            return (
              <li
                key={id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex !== null) move(dragIndex, index);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={cn(
                  "border-border bg-background flex items-center gap-2 rounded-md border p-2",
                  dragIndex === index && "opacity-50",
                )}
              >
                <GripVertical
                  className="text-muted-foreground size-4 shrink-0 cursor-grab active:cursor-grabbing"
                  aria-hidden="true"
                />
                <div className="flex-1 truncate text-sm">{renderRow(item)}</div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label="Move up"
                  >
                    <ChevronUp className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === order.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label="Move down"
                  >
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="brand" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
