import { Badge } from "@/components/ui/badge";
import type { CustomerSegment } from "../segment";

const SEGMENT_VARIANT: Record<
  CustomerSegment,
  "default" | "secondary" | "outline" | "destructive"
> = {
  VIP: "default",
  Frequent: "secondary",
  Regular: "outline",
  Inactive: "destructive",
  New: "outline",
};

export function SegmentBadge({ segment }: { segment: CustomerSegment }) {
  return <Badge variant={SEGMENT_VARIANT[segment]}>{segment}</Badge>;
}
