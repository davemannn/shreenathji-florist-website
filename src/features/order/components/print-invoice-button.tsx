"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Hidden on the printed page itself via the print:hidden wrapper in invoice/[orderNumber]/page.tsx. */
export function PrintInvoiceButton() {
  return (
    <Button variant="brand" onClick={() => window.print()}>
      <Printer className="size-4" aria-hidden="true" />
      Print / Save as PDF
    </Button>
  );
}
