import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Two download links (CSV/Excel) hitting the same export route with a different `format` query param — same pattern as the Reports page's export buttons. */
export function ExportButtons({ href }: { href: (format: "csv" | "xlsx") => string }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" nativeButton={false} render={<a href={href("csv")} />}>
        <Download className="size-3.5" aria-hidden="true" />
        CSV
      </Button>
      <Button variant="outline" size="sm" nativeButton={false} render={<a href={href("xlsx")} />}>
        <Download className="size-3.5" aria-hidden="true" />
        Excel
      </Button>
    </div>
  );
}
