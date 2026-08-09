"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlaceAutocompleteInput,
  type PlaceResult,
} from "@/components/shared/place-autocomplete-input";
import { cn } from "@/lib/utils";
import type { CheckoutValues } from "../validations";
import type { SavedAddress } from "../types";

export function AddressSection({ addresses }: { addresses: SavedAddress[] }) {
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [selectedId, setSelectedId] = useState<string | "new">(
    defaultAddress ? defaultAddress.id : "new",
  );
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutValues>();

  function selectAddress(address: SavedAddress) {
    setSelectedId(address.id);
    setValue("recipientName", address.recipientName, { shouldDirty: true, shouldValidate: true });
    setValue("recipientPhone", address.recipientPhone, { shouldDirty: true, shouldValidate: true });
    setValue("line1", address.line1, { shouldDirty: true, shouldValidate: true });
    setValue("line2", address.line2 ?? "", { shouldDirty: true });
    setValue("city", address.city, { shouldDirty: true, shouldValidate: true });
    setValue("state", address.state, { shouldDirty: true, shouldValidate: true });
    setValue("pincode", address.pincode, { shouldDirty: true, shouldValidate: true });
    setValue("latitude", address.latitude, { shouldDirty: true });
    setValue("longitude", address.longitude, { shouldDirty: true });
  }

  function selectNew() {
    setSelectedId("new");
    setValue("recipientName", "");
    setValue("recipientPhone", "");
    setValue("line1", "");
    setValue("line2", "");
    setValue("city", "");
    setValue("state", "");
    setValue("pincode", "");
    setValue("latitude", undefined);
    setValue("longitude", undefined);
  }

  function handlePlaceSelected(place: PlaceResult) {
    setValue("line1", place.line1, { shouldDirty: true, shouldValidate: true });
    setValue("city", place.city, { shouldDirty: true, shouldValidate: true });
    setValue("state", place.state, { shouldDirty: true, shouldValidate: true });
    if (place.pincode)
      setValue("pincode", place.pincode, { shouldDirty: true, shouldValidate: true });
    setValue("latitude", place.latitude, { shouldDirty: true });
    setValue("longitude", place.longitude, { shouldDirty: true });
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Delivery Address</h2>

      {addresses.length > 0 ? (
        <div
          className="mb-4 grid gap-3 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Saved addresses"
        >
          {addresses.map((address) => (
            <button
              key={address.id}
              type="button"
              role="radio"
              aria-checked={selectedId === address.id}
              onClick={() => selectAddress(address)}
              className={cn(
                "relative rounded-xs border p-3 pr-8 text-left text-sm transition-colors",
                selectedId === address.id
                  ? "border-brand bg-brand/10"
                  : "border-border hover:bg-muted",
              )}
            >
              {selectedId === address.id ? (
                <span className="bg-brand text-brand-foreground absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full">
                  <Check className="size-3" aria-hidden="true" />
                </span>
              ) : null}
              <p className="font-medium">
                {address.label ? `${address.label} — ` : ""}
                {address.recipientName}
              </p>
              <p className="text-muted-foreground">
                {address.line1}, {address.city}, {address.state} {address.pincode}
              </p>
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={selectedId === "new"}
            onClick={selectNew}
            className={cn(
              "rounded-xs border border-dashed p-3 text-left text-sm transition-colors",
              selectedId === "new" ? "border-brand bg-brand/10" : "border-border hover:bg-muted",
            )}
          >
            + Use a new address
          </button>
        </div>
      ) : null}

      {selectedId === "new" ? (
        <div className="mb-4">
          <PlaceAutocompleteInput onSelect={handlePlaceSelected} />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recipientName">Recipient Name</Label>
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
          <Label htmlFor="recipientPhone">Recipient Phone</Label>
          <Input
            id="recipientPhone"
            type="tel"
            aria-invalid={!!errors.recipientPhone}
            {...register("recipientPhone")}
          />
          {errors.recipientPhone ? (
            <p className="text-destructive text-xs">{errors.recipientPhone.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="line1">Address Line 1</Label>
          <Input id="line1" aria-invalid={!!errors.line1} {...register("line1")} />
          {errors.line1 ? <p className="text-destructive text-xs">{errors.line1.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="line2">Address Line 2 (optional)</Label>
          <Input id="line2" {...register("line2")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" aria-invalid={!!errors.city} {...register("city")} />
          {errors.city ? <p className="text-destructive text-xs">{errors.city.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" aria-invalid={!!errors.state} {...register("state")} />
          {errors.state ? <p className="text-destructive text-xs">{errors.state.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pincode">PIN Code</Label>
          <Input id="pincode" aria-invalid={!!errors.pincode} {...register("pincode")} />
          {errors.pincode ? (
            <p className="text-destructive text-xs">{errors.pincode.message}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
