"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { formatINR } from "@/lib/format";
import { redeemGiftCardAction } from "../actions";
import { redeemGiftCardSchema, type RedeemGiftCardValues } from "../validations";

/**
 * Sits alongside WalletCard on the account page — the only place a gifted
 * (OTHER-recipient) gift card's code ever gets turned into spendable wallet
 * balance. A SELF-purchase never needs this (auto-redeemed on payment).
 */
export function RedeemGiftCardForm() {
  const router = useRouter();

  const form = useForm<RedeemGiftCardValues>({
    resolver: zodResolver(redeemGiftCardSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: RedeemGiftCardValues) {
    try {
      const result = await redeemGiftCardAction(values);
      toast.success(`${formatINR(result.amount)} added to your wallet.`);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't redeem that gift card.");
    }
  }

  return (
    <div className="border-border rounded-xs border p-5">
      <div className="mb-3 flex items-center gap-2">
        <Ticket className="text-brand size-4" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Redeem a Gift Card</h2>
      </div>
      <p className="text-muted-foreground mb-3 text-xs">
        Got a gift card code? Enter it below to add its value to your wallet balance.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} placeholder="GC-XXXXXXXX" className="uppercase" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="outline" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Redeeming…" : "Redeem"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
