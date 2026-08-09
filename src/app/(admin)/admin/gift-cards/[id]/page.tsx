import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { can } from "@/server/auth/permissions";
import { getGiftCardForAdmin } from "@/features/gift-card/queries";
import { AdjustBalanceDialog } from "@/features/gift-card/components/adjust-balance-dialog";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Gift Card",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminGiftCardDetailPage({
  params,
}: PageProps<"/admin/gift-cards/[id]">) {
  const { id } = await params;
  const session = await requireAdminSession("gift_cards:view");
  const canIssue = can(session.role, "gift_cards:issue");

  const card = await getGiftCardForAdmin(id);
  if (!card) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{card.code}</h1>
          <p className="text-muted-foreground text-sm">
            Issued to {card.purchaserName} ({card.purchaserEmail})
          </p>
        </div>
        <Badge variant={card.paymentStatus === "PAID" ? "secondary" : "outline"}>
          {card.paymentStatus}
        </Badge>
      </div>

      <dl className="border-border grid grid-cols-2 gap-4 rounded-md border p-4 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">Balance</dt>
          <dd className="text-lg font-semibold">{formatINR(card.balance)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Original amount</dt>
          <dd>{formatINR(card.amount)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Recipient</dt>
          <dd>{card.recipientType === "SELF" ? "Self" : (card.recipientName ?? "—")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Recipient email</dt>
          <dd>{card.recipientEmail ?? "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground text-xs">Redemption</dt>
          <dd>
            {card.redeemedAt ? (
              <>
                Redeemed by {card.redeemedByName} ({card.redeemedByEmail}) on{" "}
                {formatDateTime(card.redeemedAt)} — value moved into their wallet balance.
              </>
            ) : card.paymentStatus === "PAID" ? (
              "Not yet claimed — the recipient hasn't entered the code to move it into a wallet."
            ) : (
              "—"
            )}
          </dd>
        </div>
        {card.message ? (
          <div className="col-span-2">
            <dt className="text-muted-foreground text-xs">Message</dt>
            <dd>{card.message}</dd>
          </div>
        ) : null}
      </dl>

      {canIssue && !card.redeemedAt ? (
        <div>
          <AdjustBalanceDialog giftCardId={card.id} currentBalance={card.balance} />
        </div>
      ) : null}

      <div>
        <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">Adjustment History</h2>
        {card.adjustments && card.adjustments.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {card.adjustments.map((adjustment) => (
              <li key={adjustment.id} className="border-border rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className={adjustment.amount >= 0 ? "text-green-600" : "text-destructive"}>
                    {adjustment.amount >= 0 ? "+" : ""}
                    {formatINR(adjustment.amount)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDateTime(adjustment.createdAt)}
                  </span>
                </div>
                <p className="mt-1">{adjustment.reason}</p>
                <p className="text-muted-foreground mt-1 text-xs">by {adjustment.adjustedByName}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No adjustments yet.</p>
        )}
      </div>
    </div>
  );
}
