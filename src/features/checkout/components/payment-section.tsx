"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutValues } from "../validations";

const PAYMENT_METHODS = [
  {
    value: "COD" as const,
    label: "Cash on Delivery",
    description: "Pay with cash when your order arrives.",
    icon: Banknote,
  },
  {
    value: "RAZORPAY" as const,
    label: "Pay Online (Razorpay)",
    description: "UPI, cards, netbanking & more.",
    icon: CreditCard,
  },
];

export function PaymentSection() {
  const { control } = useFormContext<CheckoutValues>();

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
      <Controller
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => field.onChange(method.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-xs border px-4 py-3 text-left",
                    field.value === method.value
                      ? "border-brand bg-brand/10"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <Icon className="text-brand size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">{method.label}</p>
                    <p className="text-muted-foreground text-xs">{method.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      />
    </section>
  );
}
