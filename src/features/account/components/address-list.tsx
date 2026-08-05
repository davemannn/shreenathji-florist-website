"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAddressAction, setDefaultAddressAction } from "../actions";
import { AddressFormDialog } from "./address-form-dialog";
import type { AccountAddress } from "../types";

export function AddressList({ addresses }: { addresses: AccountAddress[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteAddressAction(id);
        toast.success("Address removed.");
        refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't remove this address.");
      } finally {
        setPendingId(null);
      }
    });
  }

  function handleSetDefault(id: string) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await setDefaultAddressAction(id);
        refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update default address.");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Saved Addresses</h2>
        <AddressFormDialog onSaved={refresh} />
      </div>

      {addresses.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-xs border border-dashed p-6 text-center text-sm">
          No saved addresses yet — add one for faster checkout.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="border-border flex flex-col gap-2 rounded-xs border p-4 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {address.label ? `${address.label} — ` : ""}
                    {address.recipientName}
                    {address.isDefault ? (
                      <span className="bg-brand/10 text-brand ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                        Default
                      </span>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground text-xs">{address.recipientPhone}</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                {address.pincode}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <AddressFormDialog address={address} onSaved={refresh} />
                {!address.isDefault ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending && pendingId === address.id}
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <Star className="size-3.5" aria-hidden="true" /> Set as Default
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending && pendingId === address.id}
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" /> Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
