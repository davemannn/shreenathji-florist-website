"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, MailCheck } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { sendAbandonedCartRecoveryEmailAction } from "../actions";
import type { AdminAbandonedCart } from "../types";

function formatRelative(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function AbandonedCartsTable({ carts }: { carts: AdminAbandonedCart[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSend(cart: AdminAbandonedCart) {
    startTransition(async () => {
      try {
        await sendAbandonedCartRecoveryEmailAction(cart.userId);
        toast.success(`Recovery email sent to ${cart.customerEmail}.`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't send the email.");
      }
    });
  }

  if (carts.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        No abandoned carts right now — every signed-in customer&rsquo;s cart is either empty or
        still being actively shopped.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Subtotal</TableHead>
          <TableHead>Abandoned</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {carts.map((cart) => (
          <TableRow key={cart.userId}>
            <TableCell>
              <p className="font-medium">{cart.customerName}</p>
              <p className="text-muted-foreground text-xs">{cart.customerEmail}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm">
                {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}
              </p>
              <p
                className="text-muted-foreground truncate text-xs"
                title={cart.items.map((i) => i.productTitle).join(", ")}
              >
                {cart.items.map((i) => i.productTitle).join(", ")}
              </p>
            </TableCell>
            <TableCell>{formatINR(cart.subtotal)}</TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {formatRelative(cart.updatedAt)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                {cart.reminderSentAt ? <Badge variant="outline">Reminded</Badge> : null}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleSend(cart)}
                >
                  {cart.reminderSentAt ? (
                    <MailCheck className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Mail className="size-3.5" aria-hidden="true" />
                  )}
                  {cart.reminderSentAt ? "Resend" : "Send reminder"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
