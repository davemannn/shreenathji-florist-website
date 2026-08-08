"use client";

import { useEffect, useState, type ReactNode } from "react";
import { GripVertical, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface DashboardWidgetDef {
  id: string;
  label: string;
  node: ReactNode;
}

const STORAGE_KEY = "admin-dashboard-widget-prefs-v1";

interface WidgetPrefs {
  order: string[];
  hidden: string[];
}

function loadPrefs(availableIds: string[]): WidgetPrefs {
  if (typeof window === "undefined") return { order: availableIds, hidden: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: availableIds, hidden: [] };
    const parsed = JSON.parse(raw) as WidgetPrefs;
    // Any widget not in the saved order (e.g. newly added, or role gained
    // financial access) is appended at the end rather than dropped.
    const knownOrder = parsed.order.filter((id) => availableIds.includes(id));
    const missing = availableIds.filter((id) => !knownOrder.includes(id));
    return {
      order: [...knownOrder, ...missing],
      hidden: parsed.hidden.filter((id) => availableIds.includes(id)),
    };
  } catch {
    return { order: availableIds, hidden: [] };
  }
}

/**
 * Show/hide + reorder, persisted per-browser via localStorage — not a DB
 * row, since this is a personal display preference, not data other staff
 * or devices need to see. Data itself is always fetched server-side
 * (unconditionally, for every widget); this only decides what's rendered
 * and in what order.
 */
export function DashboardWidgetGrid({ widgets }: { widgets: DashboardWidgetDef[] }) {
  const availableIds = widgets.map((w) => w.id);
  const [prefs, setPrefs] = useState<WidgetPrefs>(() => ({ order: availableIds, hidden: [] }));
  const [hydrated, setHydrated] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  const [draftHidden, setDraftHidden] = useState<Set<string>>(new Set());
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Hydration-safety pattern (localStorage only exists client-side), same as cart-view.tsx.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(loadPrefs(availableIds));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCustomize() {
    setDraftOrder(prefs.order);
    setDraftHidden(new Set(prefs.hidden));
    setDialogOpen(true);
  }

  function moveDraft(index: number, to: number) {
    if (to < 0 || to >= draftOrder.length) return;
    setDraftOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function saveCustomize() {
    const next: WidgetPrefs = { order: draftOrder, hidden: Array.from(draftHidden) };
    setPrefs(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setDialogOpen(false);
  }

  const widgetById = new Map(widgets.map((w) => [w.id, w]));
  const visibleOrder = hydrated
    ? prefs.order.filter((id) => !prefs.hidden.includes(id) && widgetById.has(id))
    : availableIds;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" onClick={openCustomize} />}>
            <Settings2 className="size-3.5" aria-hidden="true" />
            Customize
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Customize dashboard</DialogTitle>
              <DialogDescription>
                Show/hide widgets and drag to reorder. Saved to this browser.
              </DialogDescription>
            </DialogHeader>
            <ul className="flex flex-col gap-1">
              {draftOrder.map((id, index) => {
                const widget = widgetById.get(id);
                if (!widget) return null;
                const isHidden = draftHidden.has(id);
                return (
                  <li
                    key={id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null) moveDraft(dragIndex, index);
                      setDragIndex(null);
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className="border-border bg-background flex items-center gap-2 rounded-md border p-2"
                  >
                    <GripVertical
                      className="text-muted-foreground size-4 shrink-0 cursor-grab active:cursor-grabbing"
                      aria-hidden="true"
                    />
                    <label className="flex flex-1 items-center gap-2 text-sm">
                      <Checkbox
                        checked={!isHidden}
                        onCheckedChange={(checked) =>
                          setDraftHidden((prev) => {
                            const next = new Set(prev);
                            if (checked) next.delete(id);
                            else next.add(id);
                            return next;
                          })
                        }
                      />
                      {widget.label}
                    </label>
                  </li>
                );
              })}
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="brand" onClick={saveCustomize}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {visibleOrder.map((id) => (
        <div key={id}>{widgetById.get(id)?.node}</div>
      ))}
    </div>
  );
}
