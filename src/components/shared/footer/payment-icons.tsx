import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

/** Text badges rather than payment-network logo images — no real icon assets exist yet, and logos need proper brand assets, not placeholders. */
export function PaymentIcons() {
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
      {siteConfig.paymentMethods.map((method) => (
        <li key={method}>
          <Badge variant="outline" className="border-background/30 text-background/70">
            {method}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
