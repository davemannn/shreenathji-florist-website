import { formatINR } from "@/lib/format";
import type { InvoiceData } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Address({ lines }: { lines: (string | undefined)[] }) {
  return (
    <>
      {lines.filter(Boolean).map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </>
  );
}

export function InvoiceView({ invoice }: { invoice: InvoiceData }) {
  const isTaxInvoice = !!invoice.sellerGstin;

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-sm text-black print:max-w-none print:p-0">
      <div className="flex items-start justify-between border-b border-black pb-4">
        <div>
          <h1 className="text-xl font-semibold">{invoice.sellerName}</h1>
          <div className="text-muted-foreground mt-1 text-xs">
            <Address
              lines={[
                invoice.sellerAddressLine,
                [invoice.sellerCity, invoice.sellerState, invoice.sellerPincode]
                  .filter(Boolean)
                  .join(", "),
              ]}
            />
            {invoice.sellerGstin ? (
              <p className="mt-1 font-medium">GSTIN: {invoice.sellerGstin}</p>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{isTaxInvoice ? "TAX INVOICE" : "INVOICE"}</p>
          {invoice.invoiceNumber ? (
            <>
              <p className="mt-1 text-xs">
                <span className="text-muted-foreground">Invoice No: </span>
                {invoice.invoiceNumber}
              </p>
              <p className="text-xs">
                <span className="text-muted-foreground">Invoice Date: </span>
                {invoice.invoicedAt ? formatDate(invoice.invoicedAt) : "—"}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground mt-1 text-xs">Not yet invoiced</p>
          )}
          <p className="text-xs">
            <span className="text-muted-foreground">Order No: </span>
            {invoice.orderNumber}
          </p>
          <p className="text-xs">
            <span className="text-muted-foreground">Order Date: </span>
            {formatDate(invoice.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-b border-black pb-4">
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase">Bill / Ship To</p>
          <p className="mt-1 font-medium">{invoice.buyerName}</p>
          <div className="text-xs">
            <Address
              lines={[
                invoice.buyerAddressLine1,
                invoice.buyerAddressLine2,
                [invoice.buyerCity, invoice.buyerState, invoice.buyerPincode]
                  .filter(Boolean)
                  .join(", "),
              ]}
            />
            <p>Phone: {invoice.buyerPhone}</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p>
            <span className="text-muted-foreground">Payment: </span>
            {invoice.paymentMethod === "WALLET"
              ? "Wallet"
              : invoice.paymentMethod === "COD"
                ? "Cash on Delivery"
                : "Prepaid (Razorpay)"}
            {invoice.walletAmountUsed > 0 && invoice.paymentMethod !== "WALLET"
              ? ` (${formatINR(invoice.walletAmountUsed)} from wallet)`
              : null}
          </p>
          <p>
            <span className="text-muted-foreground">Status: </span>
            {invoice.paymentStatus === "PAID"
              ? "Paid"
              : invoice.paymentStatus === "PARTIALLY_REFUNDED"
                ? "Partially Refunded"
                : invoice.paymentStatus === "REFUNDED"
                  ? "Refunded"
                  : invoice.paymentStatus}
          </p>
          {invoice.isInterState ? (
            <p className="mt-1">Place of Supply: {invoice.buyerState} (Inter-state)</p>
          ) : null}
        </div>
      </div>

      <table className="mt-4 w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-1.5 pr-2">#</th>
            <th className="py-1.5 pr-2">Item</th>
            <th className="py-1.5 pr-2">HSN</th>
            <th className="py-1.5 pr-2 text-right">Qty</th>
            <th className="py-1.5 pr-2 text-right">Rate</th>
            <th className="py-1.5 pr-2 text-right">Taxable Value</th>
            {isTaxInvoice ? <th className="py-1.5 pr-2 text-right">GST</th> : null}
            <th className="py-1.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-1.5 pr-2">{index + 1}</td>
              <td className="py-1.5 pr-2">
                {item.productTitle}
                {item.variantLabel ? ` (${item.variantLabel})` : ""}
              </td>
              <td className="py-1.5 pr-2">{item.hsnCode ?? "—"}</td>
              <td className="py-1.5 pr-2 text-right">{item.quantity}</td>
              <td className="py-1.5 pr-2 text-right">{formatINR(item.unitPrice)}</td>
              <td className="py-1.5 pr-2 text-right">{formatINR(item.taxableValue)}</td>
              {isTaxInvoice ? (
                <td className="py-1.5 pr-2 text-right">
                  {item.gstRate}% ({formatINR(item.taxAmount)})
                </td>
              ) : null}
              <td className="py-1.5 text-right">{formatINR(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-64 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Taxable Value</span>
            <span>{formatINR(invoice.taxableValue)}</span>
          </div>
          {invoice.discount > 0 ? (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatINR(invoice.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Delivery Charge</span>
            <span>{formatINR(invoice.deliveryCharge)}</span>
          </div>
          {isTaxInvoice ? (
            invoice.isInterState ? (
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">IGST</span>
                <span>{formatINR(invoice.igstAmount)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">CGST</span>
                  <span>{formatINR(invoice.cgstAmount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">SGST</span>
                  <span>{formatINR(invoice.sgstAmount)}</span>
                </div>
              </>
            )
          ) : null}
          <div className="flex justify-between border-t border-black py-1.5 text-sm font-semibold">
            <span>Grand Total</span>
            <span>{formatINR(invoice.total)}</span>
          </div>
          {invoice.walletAmountUsed > 0 ? (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Paid from Wallet</span>
              <span>-{formatINR(invoice.walletAmountUsed)}</span>
            </div>
          ) : null}
          {invoice.refundedAmount > 0 ? (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Refunded</span>
              <span>-{formatINR(invoice.refundedAmount)}</span>
            </div>
          ) : null}
          {invoice.walletAmountUsed > 0 || invoice.refundedAmount > 0 ? (
            <div className="flex justify-between border-t py-1.5 font-semibold">
              <span>{invoice.paymentMethod === "WALLET" ? "Amount Paid" : "Net Amount"}</span>
              <span>
                {formatINR(invoice.total - invoice.walletAmountUsed - invoice.refundedAmount)}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <p className="text-muted-foreground mt-8 border-t pt-3 text-[10px]">
        {isTaxInvoice
          ? "This is a computer-generated tax invoice and does not require a signature."
          : "This is not a tax invoice — the seller was not GST-registered at the time this order was confirmed."}
      </p>
    </div>
  );
}
