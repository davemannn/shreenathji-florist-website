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
import { StarRating } from "@/components/shared/star-rating";
import { deleteTestimonialAction, setTestimonialActiveAction } from "../actions";
import type { AdminTestimonial } from "../types";

export function TestimonialsTable({ testimonials }: { testimonials: AdminTestimonial[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(testimonial: AdminTestimonial) {
    startTransition(async () => {
      try {
        await setTestimonialActiveAction(testimonial.id, !testimonial.isActive);
        toast.success(testimonial.isActive ? "Testimonial hidden." : "Testimonial shown.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this testimonial.");
      }
    });
  }

  function handleDelete(testimonial: AdminTestimonial) {
    if (!window.confirm(`Permanently delete this testimonial from ${testimonial.authorName}?`))
      return;
    startTransition(async () => {
      try {
        await deleteTestimonialAction(testimonial.id);
        toast.success("Testimonial deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this testimonial.");
      }
    });
  }

  if (testimonials.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No testimonials yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Author</TableHead>
          <TableHead>Quote</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testimonials.map((testimonial) => (
          <TableRow key={testimonial.id}>
            <TableCell>
              <Link
                href={`/admin/testimonials/${testimonial.id}`}
                className="text-brand font-medium hover:underline"
              >
                {testimonial.authorName}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground max-w-sm truncate text-xs">
              {testimonial.quote}
            </TableCell>
            <TableCell>
              <StarRating rating={testimonial.rating} />
            </TableCell>
            <TableCell>
              <Badge variant={testimonial.isActive ? "secondary" : "outline"}>
                {testimonial.isActive ? "Active" : "Hidden"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/admin/testimonials/${testimonial.id}`} />}
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggleActive(testimonial)}
                >
                  <Power className="size-3.5" aria-hidden="true" />
                  {testimonial.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(testimonial)}
                  aria-label={`Permanently delete testimonial from ${testimonial.authorName}`}
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
