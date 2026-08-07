"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { StarRating } from "@/components/shared/star-rating";
import { deleteReviewAction, setReviewApprovedAction } from "../actions";
import type { AdminReview } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewsTable({ reviews }: { reviews: AdminReview[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleApproved(id: string, nextApproved: boolean) {
    startTransition(async () => {
      try {
        await setReviewApprovedAction(id, nextApproved);
        toast.success(nextApproved ? "Review approved." : "Review hidden.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this review.");
      }
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this review permanently?")) return;
    startTransition(async () => {
      try {
        await deleteReviewAction(id);
        toast.success("Review deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this review.");
      }
    });
  }

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        No reviews match this filter.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Comment</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reviews.map((review) => (
          <TableRow key={review.id}>
            <TableCell>
              <Link
                href={`/shop/product/${review.productSlug}`}
                target="_blank"
                className="text-brand hover:underline"
              >
                {review.productTitle}
              </Link>
            </TableCell>
            <TableCell>{review.authorName}</TableCell>
            <TableCell>
              <StarRating rating={review.rating} />
            </TableCell>
            <TableCell className="max-w-xs truncate text-sm" title={review.comment}>
              {review.comment}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {formatDate(review.createdAt)}
            </TableCell>
            <TableCell>
              <Badge variant={review.isApproved ? "secondary" : "outline"}>
                {review.isApproved ? "Approved" : "Pending"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggleApproved(review.id, !review.isApproved)}
                >
                  {review.isApproved ? "Hide" : "Approve"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(review.id)}
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
