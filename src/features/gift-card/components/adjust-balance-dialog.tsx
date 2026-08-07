"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { adjustGiftCardBalanceAction } from "../actions";
import {
  adjustGiftCardBalanceFormSchema,
  type AdjustGiftCardBalanceFormInput,
  type AdjustGiftCardBalanceFormValues,
} from "../validations";

export function AdjustBalanceDialog({
  giftCardId,
  currentBalance,
}: {
  giftCardId: string;
  currentBalance: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<AdjustGiftCardBalanceFormInput, unknown, AdjustGiftCardBalanceFormValues>({
    resolver: zodResolver(adjustGiftCardBalanceFormSchema),
    defaultValues: { amount: 0, reason: "" },
  });

  async function onSubmit(values: AdjustGiftCardBalanceFormValues) {
    try {
      await adjustGiftCardBalanceAction(giftCardId, values);
      toast.success("Balance adjusted.");
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't adjust this balance.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Wallet className="size-4" aria-hidden="true" />
        Adjust Balance
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust balance</DialogTitle>
          <DialogDescription>
            Current balance: ₹{currentBalance}. Use a negative amount to debit.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value as number}
                      placeholder="e.g. 200 or -100"
                    />
                  </FormControl>
                  <FormDescription>
                    Positive credits the balance, negative debits it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Refund adjustment for order #1234" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Save Adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
