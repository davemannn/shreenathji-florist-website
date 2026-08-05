import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/shared/placeholder-image";

interface ContentImageProps {
  /** Omit to fall back to PlaceholderImage — used wherever a fixture doesn't have a photo yet. */
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders a real photo via next/image when `src` is present, otherwise falls
 * back to the labeled placeholder block. Lets fixtures adopt real photography
 * incrementally — no component needs to change when a `src` is added or
 * removed from a feature's queries.ts.
 */
export function ContentImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority,
}: ContentImageProps) {
  if (!src) {
    return <PlaceholderImage label={alt} className={className} />;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
