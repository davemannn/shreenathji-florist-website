import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/server/auth/config";
import { findOrderByNumber } from "@/server/repositories/order.repository";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default async function OrderSuccessPage({
  params,
}: PageProps<"/order-success/[orderNumber]">) {
  const { orderNumber } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/sign-in?redirectTo=/order-success/${orderNumber}`);
  }

  const order = await findOrderByNumber(orderNumber, session.user.id);
  if (!order) notFound();

  const deliveryDate = order.deliveryDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6 lg:px-8">
      <CheckCircle2 className="text-brand mx-auto size-14" aria-hidden="true" />
      <h1 className="mt-4 text-3xl md:text-4xl">Order Confirmed!</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Order <span className="text-foreground font-medium">{order.orderNumber}</span> has been
        placed
        {order.paymentMethod === "COD" ? " — pay on delivery." : " and payment received."}
      </p>

      <div className="border-border mt-8 flex flex-col gap-4 rounded-xs border p-6 text-left">
        <div className="flex flex-col gap-1 border-b pb-4">
          <p className="text-sm">
            <span className="text-muted-foreground">Delivering to: </span>
            {order.recipientName}, {order.deliveryLine1}
            {order.deliveryLine2 ? `, ${order.deliveryLine2}` : ""}, {order.deliveryCity},{" "}
            {order.deliveryState} {order.deliveryPincode}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Expected: </span>
            {deliveryDate}
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.productTitle}
                {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
              </span>
              <span>{formatINR(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatINR(order.total)}</span>
        </div>
      </div>

      <Button
        variant="brand"
        size="lg"
        className="mt-8"
        nativeButton={false}
        render={<Link href="/shop" />}
      >
        Continue Shopping
      </Button>
    </div>
  );
}
