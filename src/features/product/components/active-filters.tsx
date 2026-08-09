import Link from "next/link";
import { X } from "lucide-react";

export interface ActiveFilterChip {
  label: string;
  /** URL with just this one filter removed, everything else preserved. */
  removeHref: string;
}

/** Shown above the product grid whenever at least one filter/sort beyond the defaults is active. */
export function ActiveFilters({
  chips,
  clearAllHref,
}: {
  chips: ActiveFilterChip[];
  clearAllHref: string;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.removeHref}
          className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
        >
          {chip.label}
          <X className="size-3" aria-hidden="true" />
        </Link>
      ))}
      <Link href={clearAllHref} className="text-brand text-xs underline underline-offset-2">
        Clear all
      </Link>
    </div>
  );
}
