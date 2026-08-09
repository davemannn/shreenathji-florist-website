"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { formatINR } from "@/lib/format";
import { subscribeAction, verifySubscriptionPaymentAction } from "../actions";
import { subscribeFormSchema, type SubscribeFormValues } from "../validations";
import { openRazorpaySubscriptionCheckout } from "@/lib/razorpay-checkout";
import type { SavedAddress } from "@/features/checkout/types";
import type { SubscriptionPlanIntervalOption } from "../types";

interface SubscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  interval: SubscriptionPlanIntervalOption;
  defaultAddress?: SavedAddress;
  isSignedIn: boolean;
}

export function SubscribeDialog({
  open,
  onOpenChange,
  planName,
  interval,
  defaultAddress,
  isSignedIn,
}: SubscribeDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeFormSchema),
    defaultValues: {
      subscriptionPlanIntervalId: interval.id,
      recipientName: defaultAddress?.recipientName ?? "",
      recipientPhone: defaultAddress?.recipientPhone ?? "",
      line1: defaultAddress?.line1 ?? "",
      line2: defaultAddress?.line2 ?? "",
      city: defaultAddress?.city ?? "",
      state: defaultAddress?.state ?? "",
      pincode: defaultAddress?.pincode ?? "",
    },
  });

  async function onSubmit(values: SubscribeFormValues) {
    if (!isSignedIn) {
      router.push(`/sign-in?redirectTo=/subscriptions`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await subscribeAction(values);

      await openRazorpaySubscriptionCheckout({
        keyId: result.keyId,
        razorpaySubscriptionId: result.razorpaySubscriptionId,
        description: `${planName} — ${interval.interval.toLowerCase()} subscription`,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        onSuccess: async (response) => {
          try {
            await verifySubscriptionPaymentAction({
              razorpaySubscriptionId: response.razorpay_subscription_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Subscribed! Your first delivery will be scheduled shortly.");
            onOpenChange(false);
            router.push("/account/subscriptions");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Couldn't verify the subscription payment.",
            );
            setSubmitting(false);
          }
        },
        onDismiss: () => {
          toast.info("Subscription setup cancelled — you can try again anytime.");
          setSubmitting(false);
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't start the subscription.");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Subscribe — {planName} ({interval.interval.toLowerCase()})
          </DialogTitle>
          <DialogDescription>
            {formatINR(interval.price)} per {interval.interval.toLowerCase().replace("ly", "")}{" "}
            billing cycle, charged automatically to your card/UPI until you cancel.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address line 2 (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={submitting}>
                {submitting
                  ? "Starting…"
                  : isSignedIn
                    ? "Authorize & Subscribe"
                    : "Sign In to Subscribe"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
