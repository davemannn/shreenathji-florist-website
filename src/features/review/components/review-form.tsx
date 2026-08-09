"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitReviewAction } from "../actions";

interface ReviewFormProps {
  productId: string;
  productSlug: string;
}

export function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Pick a rating first.");
      return;
    }
    setSubmitting(true);
    try {
      await submitReviewAction({ productId, productSlug, rating, comment });
      setSubmitted(true);
      toast.success("Thanks — your review is awaiting approval.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="border-border bg-muted/40 rounded-xs border p-4 text-sm">
        Thanks for your review — it&rsquo;s awaiting approval and will show up here once it&rsquo;s
        live.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border flex flex-col gap-3 rounded-xs border p-5"
    >
      <h3 className="text-sm font-semibold">Write a Review</h3>

      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1;
          const filled = value <= (hoverRating || rating);
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${value} out of 5`}
              className="p-0.5"
            >
              <Star
                className={cn("size-5", filled ? "fill-brand text-brand" : "fill-muted text-muted")}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Share your experience with this product..."
        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
      />

      <Button type="submit" variant="brand" size="sm" className="w-fit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}
