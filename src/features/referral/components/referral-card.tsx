"use client";

import { useState } from "react";
import { Copy, Check, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WhatsAppChatLink } from "@/components/shared/whatsapp-chat-link";
import { formatINR } from "@/lib/format";
import type { ReferralInfo } from "../types";

export function ReferralCard({ info }: { info: ReferralInfo }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(info.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shareMessage = `Here's ${formatINR(info.bonusAmount)} off flowers/cakes from Shrinathji Florist — sign up with my link and we both get wallet credit: ${info.referralUrl}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="border-border rounded-xs border p-5">
        <p className="text-sm font-medium">
          Give {formatINR(info.bonusAmount)}, get {formatINR(info.bonusAmount)}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Share your link. When a friend signs up and places their first order, you both get{" "}
          {formatINR(info.bonusAmount)} added to your wallet.
        </p>

        <div className="mt-4 flex gap-2">
          <Input readOnly value={info.referralUrl} className="font-mono text-xs" />
          <Button type="button" variant="outline" onClick={handleCopy} className="shrink-0">
            {copied ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden="true" />
                Copy
              </>
            )}
          </Button>
        </div>

        <WhatsAppChatLink message={shareMessage} className="text-brand mt-3 w-fit text-sm">
          Share on WhatsApp
        </WhatsAppChatLink>
      </div>

      <div className="border-border flex items-center gap-3 rounded-xs border p-4">
        <div className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
          <Users className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium">
            {info.referredCount} friend{info.referredCount === 1 ? "" : "s"} referred
          </p>
          <p className="text-muted-foreground text-xs">
            Wallet credit lands automatically once their first order is confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}
