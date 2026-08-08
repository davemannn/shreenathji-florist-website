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
import { SegmentBadge } from "./segment-badge";
import type { AdminCustomerListItem } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CustomersTable({ customers }: { customers: AdminCustomerListItem[] }) {
  if (customers.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No customers found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Lifetime Spend</TableHead>
          <TableHead>Segment</TableHead>
          <TableHead>Tags</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <Link
                href={`/admin/customers/${customer.id}`}
                className="text-brand font-medium hover:underline"
              >
                {customer.name}
              </Link>
              <p className="text-muted-foreground text-xs">{customer.email}</p>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {formatDate(customer.joinedAt)}
            </TableCell>
            <TableCell>{customer.lifetimeOrderCount}</TableCell>
            <TableCell>{formatINR(customer.lifetimeSpent)}</TableCell>
            <TableCell>
              <SegmentBadge segment={customer.segment} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
