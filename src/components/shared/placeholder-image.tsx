import { ImageOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  /** Describes what will eventually go here — announced to screen readers. */
  label: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Stand-in for a real photo. No real product/hero photography exists in this
 * repo yet, so every image slot renders one of these instead of a fake stock
 * photo or a hotlinked reference-theme image. Swapping in real photography
 * later means replacing this component's usage with `next/image`, not
 * touching the sections that lay it out.
 */
export function PlaceholderImage({
  label,
  icon: Icon = ImageOff,
  className,
}: PlaceholderImageProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "bg-muted text-muted-foreground flex flex-col items-center justify-center gap-2",
        className,
      )}
    >
      <Icon className="size-8 opacity-40" aria-hidden="true" />
      <span className="px-2 text-center text-xs font-medium opacity-60">{label}</span>
    </div>
  );
}
