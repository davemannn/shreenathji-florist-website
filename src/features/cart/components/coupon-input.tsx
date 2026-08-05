"use client";

import { useState, useTransition } from "react";
import { Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateCoupon } from "../actions";
import type { AppliedCoupon } from "../types";

interface CouponInputProps {
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon | null) => void;
}

export function CouponInput({ subtotal, appliedCoupon, onApply }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApply() {
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await validateCoupon(code.trim(), subtotal);
      if (!result.valid) {
        setError(result.error ?? "Invalid coupon code.");
        return;
      }
      onApply({ code: result.code, discount: result.discount });
      setCode("");
    });
  }

  if (appliedCoupon) {
    return (
      <div className="bg-brand/10 flex items-center justify-between rounded-xs px-3 py-2 text-sm">
        <span className="flex items-center gap-1.5">
          <Tag className="text-brand size-3.5" aria-hidden="true" />
          <span className="font-medium">{appliedCoupon.code}</span> applied
        </span>
        <button
          type="button"
          onClick={() => onApply(null)}
          aria-label="Remove coupon"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Coupon code"
          aria-label="Coupon code"
        />
        <Button variant="outline" onClick={handleApply} disabled={isPending || !code.trim()}>
          {isPending ? "Checking…" : "Apply"}
        </Button>
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
