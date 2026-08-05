"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { DeliveryDatePicker } from "./delivery-date-picker";
import type { CheckoutValues } from "../validations";
import type { DeliverySlotOption } from "../types";

export function DeliverySection({ deliverySlots }: { deliverySlots: DeliverySlotOption[] }) {
  const { control, register } = useFormContext<CheckoutValues>();

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Delivery Details</h2>

      <div className="flex flex-col gap-4">
        <div>
          <Label className="mb-2 block">Delivery Date</Label>
          <Controller
            control={control}
            name="deliveryDate"
            render={({ field }) => (
              <DeliveryDatePicker value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {deliverySlots.length > 0 ? (
          <div>
            <Label className="mb-2 block">Delivery Slot</Label>
            <Controller
              control={control}
              name="deliverySlotId"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  {deliverySlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => field.onChange(slot.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xs border px-4 py-2.5 text-left text-sm",
                        field.value === slot.id
                          ? "border-brand bg-brand/10"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      <span>{slot.label}</span>
                      {slot.extraCharge > 0 ? (
                        <span className="text-muted-foreground">
                          +{formatINR(slot.extraCharge)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Free</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="messageCard">Message Card (optional)</Label>
          <textarea
            id="messageCard"
            rows={3}
            maxLength={300}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
            placeholder="Write a short message for the recipient..."
            {...register("messageCard")}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-brand size-4" {...register("giftWrap")} />
          Add gift wrap
        </label>
      </div>
    </section>
  );
}
