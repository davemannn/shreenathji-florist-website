import { Wallet } from "lucide-react";
import { formatINR } from "@/lib/format";

export function WalletCard({ balance }: { balance: number }) {
  return (
    <div className="border-border bg-muted/30 flex items-center gap-4 rounded-xs border p-5">
      <div className="bg-brand/10 text-brand flex size-12 shrink-0 items-center justify-center rounded-full">
        <Wallet className="size-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs tracking-wide uppercase">Wallet Balance</p>
        <p className="text-2xl font-semibold">{formatINR(balance)}</p>
        <p className="text-muted-foreground text-xs">
          Credited by redeeming a gift card — spend it at checkout.
        </p>
      </div>
    </div>
  );
}
