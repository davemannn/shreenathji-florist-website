"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { processRefundAction } from "../actions";
import {
  processRefundSchema,
  type ProcessRefundInput,
  type ProcessRefundValues,
} from "../validations";

interface ProcessRefundDialogProps {
  orderId: string;
  /** `total - walletAmountUsed - refundedAmount` — what's actually left to refund via Razorpay. */
  maxRefundable: number;
}

/**
 * Only rendered when eligible (order CANCELLED, paid via Razorpay, and
 * something left to refund) — see the admin order detail page. Full/Partial
 * is just a UI toggle over the same `amount` field; the server independently
 * re-validates the amount against the real remaining balance either way.
 */
export function ProcessRefundDialog({ orderId, maxRefundable }: ProcessRefundDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"FULL" | "PARTIAL">("FULL");

  const form = useForm<ProcessRefundInput, unknown, ProcessRefundValues>({
    resolver: zodResolver(processRefundSchema),
    defaultValues: { orderId, amount: maxRefundable, reason: "" },
  });

  function handleModeChange(next: "FULL" | "PARTIAL") {
    setMode(next);
    form.setValue("amount", next === "FULL" ? maxRefundable : 0);
  }

  async function onSubmit(values: ProcessRefundValues) {
    try {
      await processRefundAction(values);
      toast.success(`${formatINR(values.amount)} refund processed.`);
      setOpen(false);
      form.reset({ orderId, amount: maxRefundable, reason: "" });
      setMode("FULL");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't process this refund.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Undo2 className="size-4" aria-hidden="true" />
        Process Refund
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Process refund</DialogTitle>
          <DialogDescription>
            Up to {formatINR(maxRefundable)} left to refund via Razorpay for this order.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleModeChange("FULL")}
                className={cn(
                  "flex-1 rounded-xs border px-3 py-2 text-left text-sm",
                  mode === "FULL" ? "border-brand bg-brand/10" : "border-border hover:bg-muted",
                )}
              >
                <p className="font-medium">Full Refund</p>
                <p className="text-muted-foreground text-xs">{formatINR(maxRefundable)}</p>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("PARTIAL")}
                className={cn(
                  "flex-1 rounded-xs border px-3 py-2 text-left text-sm",
                  mode === "PARTIAL" ? "border-brand bg-brand/10" : "border-border hover:bg-muted",
                )}
              >
                <p className="font-medium">Partial Refund</p>
                <p className="text-muted-foreground text-xs">Choose an amount</p>
              </button>
            </div>

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
                      disabled={mode === "FULL"}
                      max={maxRefundable}
                      min={1}
                    />
                  </FormControl>
                  <FormDescription>Cannot exceed {formatINR(maxRefundable)}.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={2}
                      placeholder="Customer requested cancellation"
                      className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                    />
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
                {form.formState.isSubmitting ? "Processing…" : "Process Refund"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
