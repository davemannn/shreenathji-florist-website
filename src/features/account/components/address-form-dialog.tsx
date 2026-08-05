"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addAddressAction, updateAddressAction } from "../actions";
import { addressSchema, type AddressValues } from "../validations";
import type { AccountAddress } from "../types";

interface AddressFormDialogProps {
  address?: AccountAddress;
  onSaved: () => void;
}

/** Same dialog handles both "Add new address" (no `address` prop) and "Edit" (address prop passed). */
export function AddressFormDialog({ address, onSaved }: AddressFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!address;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? "",
      recipientName: address?.recipientName ?? "",
      recipientPhone: address?.recipientPhone ?? "",
      line1: address?.line1 ?? "",
      line2: address?.line2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      pincode: address?.pincode ?? "",
    },
  });

  // Reset the form back to this address's saved values whenever the dialog re-opens.
  useEffect(() => {
    if (open) {
      reset({
        label: address?.label ?? "",
        recipientName: address?.recipientName ?? "",
        recipientPhone: address?.recipientPhone ?? "",
        line1: address?.line1 ?? "",
        line2: address?.line2 ?? "",
        city: address?.city ?? "",
        state: address?.state ?? "",
        pincode: address?.pincode ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: AddressValues) {
    try {
      if (isEdit && address) {
        await updateAddressAction(address.id, values);
        toast.success("Address updated.");
      } else {
        await addAddressAction(values);
        toast.success("Address added.");
      }
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this address.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant={isEdit ? "outline" : "brand"} size={isEdit ? "sm" : "default"} />}
      >
        {isEdit ? (
          <>
            <Pencil className="size-3.5" aria-hidden="true" /> Edit
          </>
        ) : (
          <>
            <Plus className="size-4" aria-hidden="true" /> Add New Address
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Address" : "Add New Address"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="label">Label (optional)</Label>
            <Input id="label" placeholder="Home, Office…" {...register("label")} />
          </div>
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
                aria-invalid={!!errors.recipientPhone}
                {...register("recipientPhone")}
              />
              {errors.recipientPhone ? (
                <p className="text-destructive text-xs">{errors.recipientPhone.message}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="line1">Address Line 1</Label>
            <Input id="line1" aria-invalid={!!errors.line1} {...register("line1")} />
            {errors.line1 ? (
              <p className="text-destructive text-xs">{errors.line1.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="line2">Address Line 2 (optional)</Label>
            <Input id="line2" {...register("line2")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" aria-invalid={!!errors.city} {...register("city")} />
              {errors.city ? (
                <p className="text-destructive text-xs">{errors.city.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="state">State</Label>
              <Input id="state" aria-invalid={!!errors.state} {...register("state")} />
              {errors.state ? (
                <p className="text-destructive text-xs">{errors.state.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pincode">PIN Code</Label>
              <Input id="pincode" aria-invalid={!!errors.pincode} {...register("pincode")} />
              {errors.pincode ? (
                <p className="text-destructive text-xs">{errors.pincode.message}</p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
