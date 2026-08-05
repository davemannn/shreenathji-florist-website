"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Gift, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { DeliveryDatePicker } from "@/features/checkout/components/delivery-date-picker";
import { todayIsoIst } from "@/lib/delivery";
import { purchaseGiftCardAction, verifyGiftCardPaymentAction } from "../actions";
import {
  GIFT_CARD_DENOMINATIONS,
  MAX_GIFT_CARD_AMOUNT,
  MIN_GIFT_CARD_AMOUNT,
  giftCardSchema,
  type GiftCardValues,
} from "../validations";

interface GiftCardFormProps {
  purchaserName: string;
  purchaserPhone?: string;
}

export function GiftCardForm({ purchaserName, purchaserPhone }: GiftCardFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [customAmount, setCustomAmount] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GiftCardValues>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      amount: GIFT_CARD_DENOMINATIONS[0],
      recipientType: "SELF",
      recipientName: "",
      recipientEmail: "",
      recipientPhone: "",
      message: "",
      deliveryDate: todayIsoIst(),
    },
  });

  // useWatch (not the destructured `watch` off useForm()) — React Compiler
  // flags calling `useForm()`'s own `watch` function directly as an
  // unmemoizable "incompatible library" pattern; useWatch is its
  // compiler-friendly hook equivalent.
  const amount = useWatch({ control, name: "amount" });
  const recipientType = useWatch({ control, name: "recipientType" });

  async function onSubmit(values: GiftCardValues) {
    setSubmitting(true);
    try {
      const result = await purchaseGiftCardAction(values);

      await openRazorpayCheckout({
        keyId: result.razorpay.keyId,
        amount: Number(result.razorpay.amount),
        razorpayOrderId: result.razorpay.orderId,
        description: "Gift Card Purchase",
        recipientName: purchaserName,
        recipientPhone: purchaserPhone ?? "",
        onSuccess: async (response) => {
          try {
            await verifyGiftCardPaymentAction({
              giftCardId: result.giftCardId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            router.push(`/gift-cards/${result.code}`);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment verification failed.");
            setSubmitting(false);
          }
        },
        onDismiss: () => {
          toast.info("Payment cancelled.");
          setSubmitting(false);
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      <div>
        <Label className="mb-2 block">Choose an amount</Label>
        <div className="flex flex-wrap gap-2">
          {GIFT_CARD_DENOMINATIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setCustomAmount(false);
                setValue("amount", value, { shouldValidate: true });
              }}
              className={cn(
                "rounded-xs border px-5 py-2.5 text-sm font-medium",
                !customAmount && amount === value
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border hover:bg-muted",
              )}
            >
              {formatINR(value)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCustomAmount(true)}
            className={cn(
              "rounded-xs border px-5 py-2.5 text-sm font-medium",
              customAmount ? "border-brand bg-brand/10 text-brand" : "border-border hover:bg-muted",
            )}
          >
            Custom
          </button>
        </div>
        {customAmount ? (
          <div className="mt-3 max-w-48">
            <Input
              type="number"
              min={MIN_GIFT_CARD_AMOUNT}
              max={MAX_GIFT_CARD_AMOUNT}
              placeholder={`₹${MIN_GIFT_CARD_AMOUNT} - ₹${MAX_GIFT_CARD_AMOUNT}`}
              {...register("amount", { valueAsNumber: true })}
            />
          </div>
        ) : null}
        {errors.amount ? (
          <p className="text-destructive mt-1.5 text-xs">{errors.amount.message}</p>
        ) : null}
      </div>

      <div>
        <Label className="mb-2 block">Who is this for?</Label>
        <Controller
          control={control}
          name="recipientType"
          render={({ field }) => (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => field.onChange("SELF")}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-xs border px-4 py-3 text-left text-sm",
                  field.value === "SELF"
                    ? "border-brand bg-brand/10"
                    : "border-border hover:bg-muted",
                )}
              >
                <User className="text-brand size-4 shrink-0" aria-hidden="true" />
                Myself
              </button>
              <button
                type="button"
                onClick={() => field.onChange("OTHER")}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-xs border px-4 py-3 text-left text-sm",
                  field.value === "OTHER"
                    ? "border-brand bg-brand/10"
                    : "border-border hover:bg-muted",
                )}
              >
                <Users className="text-brand size-4 shrink-0" aria-hidden="true" />
                Someone Else
              </button>
            </div>
          )}
        />
      </div>

      {recipientType === "OTHER" ? (
        <div className="flex flex-col gap-4 border-l-2 pl-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recipientName">Recipient&apos;s Name</Label>
              <Input
                id="recipientName"
                aria-invalid={!!errors.recipientName}
                {...register("recipientName")}
              />
              {errors.recipientName ? (
                <p className="text-destructive text-xs">{errors.recipientName.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recipientEmail">Recipient&apos;s Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                aria-invalid={!!errors.recipientEmail}
                {...register("recipientEmail")}
              />
              {errors.recipientEmail ? (
                <p className="text-destructive text-xs">{errors.recipientEmail.message}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="recipientPhone">Recipient&apos;s Phone (optional)</Label>
            <Input id="recipientPhone" {...register("recipientPhone")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Personal Message (optional)</Label>
            <textarea
              id="message"
              rows={3}
              maxLength={300}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
              placeholder="Write a short message..."
              {...register("message")}
            />
          </div>
        </div>
      ) : null}

      <div>
        <Label className="mb-2 block">
          {recipientType === "OTHER" ? "Send On" : "Available From"}
        </Label>
        <Controller
          control={control}
          name="deliveryDate"
          render={({ field }) => (
            <DeliveryDatePicker value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <Button type="submit" variant="brand" size="lg" disabled={submitting} className="self-start">
        <Gift aria-hidden="true" />
        {submitting ? "Processing…" : `Pay ${formatINR(amount || 0)} & Send`}
      </Button>
    </form>
  );
}
