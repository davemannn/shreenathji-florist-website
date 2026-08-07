"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import { tomorrowIsoIst } from "@/lib/delivery";
import type { StoreSettings } from "@/features/settings/types";
import { checkoutSchema, type CheckoutValues } from "../validations";
import { placeOrderAction, verifyRazorpayPaymentAction } from "../actions";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { AddressSection } from "./address-section";
import { DeliverySection } from "./delivery-section";
import { PaymentSection } from "./payment-section";
import { OrderSummary } from "./order-summary";
import type { DeliverySlotOption, SavedAddress } from "../types";

interface CheckoutFormProps {
  addresses: SavedAddress[];
  deliverySlots: DeliverySlotOption[];
  storeSettings: StoreSettings;
}

export function CheckoutForm({ addresses, deliverySlots, storeSettings }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const clearCart = useCartStore((state) => state.clear);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Same hydration-safety pattern as CartView — cart state is localStorage-backed.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    // `submitting` stays true through the whole successful-order path (it's
    // only reset to false on error) — guards against this firing and
    // racing the post-order clearCart() + redirect to /order-success.
    if (hydrated && !submitting && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, submitting, items.length, router]);

  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  // Standard delivery isn't bookable for today (see lib/delivery.ts), so the
  // sensible default pairing is tomorrow + Standard rather than today +
  // whatever slot happens to sort first.
  const defaultSlot = deliverySlots.find((slot) => slot.type === "NORMAL") ?? deliverySlots[0];

  const methods = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      recipientName: defaultAddress?.recipientName ?? "",
      recipientPhone: defaultAddress?.recipientPhone ?? "",
      line1: defaultAddress?.line1 ?? "",
      line2: defaultAddress?.line2 ?? "",
      city: defaultAddress?.city ?? "",
      state: defaultAddress?.state ?? "",
      pincode: defaultAddress?.pincode ?? "",
      deliveryDate: tomorrowIsoIst(),
      deliverySlotId: defaultSlot?.id,
      messageCard: "",
      giftWrap: false,
      paymentMethod: "COD",
    },
  });

  async function onSubmit(values: CheckoutValues) {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeOrderAction({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productTitle: item.productTitle,
          variantLabel: item.variantLabel,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
        })),
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        line1: values.line1,
        line2: values.line2,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        deliveryDate: values.deliveryDate,
        deliverySlotId: values.deliverySlotId,
        messageCard: values.messageCard,
        giftWrap: values.giftWrap,
        couponCode: appliedCoupon?.code,
        paymentMethod: values.paymentMethod,
      });

      if (result.razorpay) {
        await openRazorpayCheckout({
          keyId: result.razorpay.keyId,
          amount: Number(result.razorpay.amount),
          razorpayOrderId: result.razorpay.orderId,
          recipientName: values.recipientName,
          recipientPhone: values.recipientPhone,
          onSuccess: async (response) => {
            try {
              await verifyRazorpayPaymentAction({
                orderId: result.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              router.push(`/order-success/${result.orderNumber}`);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Payment verification failed.");
              setSubmitting(false);
            }
          },
          onDismiss: () => {
            toast.info(
              "Payment cancelled. Your order is saved as pending — you can retry from your account.",
            );
            setSubmitting(false);
          },
        });
      } else {
        clearCart();
        router.push(`/order-success/${result.orderNumber}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (!hydrated || items.length === 0) return null;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="grid gap-10 lg:grid-cols-[1fr_360px]"
      >
        <div className="flex flex-col gap-8">
          <AddressSection addresses={addresses} />
          <DeliverySection deliverySlots={deliverySlots} storeSettings={storeSettings} />
          <PaymentSection />
        </div>
        <OrderSummary
          deliverySlots={deliverySlots}
          submitting={submitting}
          storeSettings={storeSettings}
        />
      </form>
    </FormProvider>
  );
}
