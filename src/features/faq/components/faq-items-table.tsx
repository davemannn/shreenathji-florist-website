"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Power, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteFaqItemAction, setFaqItemActiveAction } from "../actions";
import type { AdminFaqItem } from "../types";

export function FaqItemsTable({ faqItems }: { faqItems: AdminFaqItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(item: AdminFaqItem) {
    startTransition(async () => {
      try {
        await setFaqItemActiveAction(item.id, !item.isActive);
        toast.success(item.isActive ? "FAQ hidden." : "FAQ shown.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this FAQ.");
      }
    });
  }

  function handleDelete(item: AdminFaqItem) {
    if (!window.confirm(`Permanently delete "${item.question}"?`)) return;
    startTransition(async () => {
      try {
        await deleteFaqItemAction(item.id);
        toast.success("FAQ deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this FAQ.");
      }
    });
  }

  if (faqItems.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No FAQs yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Question</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {faqItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="max-w-sm">
              <Link
                href={`/admin/faqs/${item.id}`}
                className="text-brand font-medium hover:underline"
              >
                {item.question}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">{item.category ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={item.isActive ? "secondary" : "outline"}>
                {item.isActive ? "Active" : "Hidden"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/admin/faqs/${item.id}`} />}
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggleActive(item)}
                >
                  <Power className="size-3.5" aria-hidden="true" />
                  {item.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(item)}
                  aria-label={`Permanently delete "${item.question}"`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
