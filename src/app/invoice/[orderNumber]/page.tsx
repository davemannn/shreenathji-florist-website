import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/server/auth/config";
import { can, isAdminRole } from "@/server/auth/permissions";
import { getInvoiceData } from "@/features/order/queries";
import { InvoiceView } from "@/features/order/components/invoice-view";
import { PrintInvoiceButton } from "@/features/order/components/print-invoice-button";

export const metadata: Metadata = {
  title: "Invoice",
};

/**
 * Deliberately outside both (storefront) and (admin) route groups — no site
 * header/footer/admin sidebar, just the invoice itself, so printing it
 * doesn't print site chrome around it.
 */
export default async function InvoicePage({ params }: PageProps<"/invoice/[orderNumber]">) {
  const { orderNumber } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/sign-in?redirectTo=/invoice/${orderNumber}`);
  }

  const invoice = await getInvoiceData(orderNumber);
  if (!invoice) notFound();

  // Owner or staff with orders:view:all — anyone else gets a 404 rather
  // than a 403, so this doesn't confirm/deny an order number's existence
  // to someone who shouldn't be looking it up.
  const isOwner = invoice.buyerUserId === session.user.id;
  const isStaff = isAdminRole(session.user.role) && can(session.user.role, "orders:view:all");
  if (!isOwner && !isStaff) notFound();

  return (
    <div className="min-h-full bg-neutral-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-3xl justify-end print:hidden">
        <PrintInvoiceButton />
      </div>
      <InvoiceView invoice={invoice} />
    </div>
  );
}
