import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import { OrderStatusBadge } from "./order-status-badge";
import type { OrderListItem } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function OrdersTable({ orders }: { orders: OrderListItem[] }) {
  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        No orders match these filters.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Delivery</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Link
                href={`/admin/orders/${order.id}`}
                className="text-brand font-medium hover:underline"
              >
                {order.orderNumber}
              </Link>
              <p className="text-muted-foreground text-xs">{order.customerName}</p>
            </TableCell>
            <TableCell>
              <p>{order.recipientName}</p>
              <p className="text-muted-foreground text-xs">{order.recipientPhone}</p>
            </TableCell>
            <TableCell>{order.itemCount}</TableCell>
            <TableCell className="font-medium">{formatINR(order.total)}</TableCell>
            <TableCell>
              <Badge variant={order.paymentStatus === "PAID" ? "secondary" : "outline"}>
                {order.paymentMethod === "WALLET"
                  ? "Wallet"
                  : order.paymentMethod === "COD"
                    ? "COD"
                    : "Razorpay"}{" "}
                · {order.paymentStatus.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {order.assignedDeliveryPersonName ?? <span className="italic">Unassigned</span>}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
