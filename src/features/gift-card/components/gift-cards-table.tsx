import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import type { AdminGiftCard } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_VARIANT: Record<
  AdminGiftCard["paymentStatus"],
  "secondary" | "outline" | "destructive"
> = {
  PAID: "secondary",
  // Not a real gift-card state (no refund flow exists for gift card
  // purchases) — included only because paymentStatus shares Order's enum.
  PARTIALLY_REFUNDED: "outline",
  PENDING: "outline",
  FAILED: "destructive",
  REFUNDED: "outline",
};

/** Read-only — server component. Balance adjustment lives on the detail page, gated to Super Admin there. */
export function GiftCardsTable({ giftCards }: { giftCards: AdminGiftCard[] }) {
  if (giftCards.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No gift cards yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Purchaser</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Redemption</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {giftCards.map((card) => (
          <TableRow key={card.id}>
            <TableCell>
              <Link
                href={`/admin/gift-cards/${card.id}`}
                className="text-brand font-medium hover:underline"
              >
                {card.code}
              </Link>
            </TableCell>
            <TableCell className="text-xs">
              <div>{card.purchaserName}</div>
              <div className="text-muted-foreground">{card.purchaserEmail}</div>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {card.recipientType === "SELF" ? "Self" : (card.recipientName ?? "—")}
            </TableCell>
            <TableCell>
              {formatINR(card.balance)}
              {card.balance !== card.amount ? (
                <span className="text-muted-foreground"> / {formatINR(card.amount)}</span>
              ) : null}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[card.paymentStatus]}>{card.paymentStatus}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {card.redeemedAt ? (
                <>
                  Redeemed by {card.redeemedByName}
                  <div>{formatDate(card.redeemedAt)}</div>
                </>
              ) : card.paymentStatus === "PAID" ? (
                "Unclaimed"
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {formatDate(card.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
