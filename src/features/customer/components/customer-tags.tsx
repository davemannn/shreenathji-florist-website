"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCustomerTagAction, removeCustomerTagAction } from "../actions";

interface CustomerTagsProps {
  userId: string;
  tags: { id: string; label: string }[];
}

export function CustomerTags({ userId, tags }: CustomerTagsProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const label = value.trim();
    if (!label) return;
    startTransition(async () => {
      try {
        await addCustomerTagAction(userId, { label });
        setValue("");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add this tag.");
      }
    });
  }

  function handleRemove(tagId: string, label: string) {
    startTransition(async () => {
      try {
        await removeCustomerTagAction(userId, tagId, label);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't remove this tag.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.length === 0 ? (
          <p className="text-muted-foreground text-xs">No tags yet.</p>
        ) : (
          tags.map((tag) => (
            <Badge key={tag.id} variant="outline" className="gap-1 pr-1">
              {tag.label}
              <button
                type="button"
                onClick={() => handleRemove(tag.id, tag.label)}
                disabled={isPending}
                aria-label={`Remove tag ${tag.label}`}
                className="hover:bg-muted-foreground/20 flex size-3.5 items-center justify-center rounded-full"
              >
                <X className="size-2.5" aria-hidden="true" />
              </button>
            </Badge>
          ))
        )}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Wedding season lead"
          className="h-7 max-w-56 text-xs"
        />
        <Button type="submit" variant="outline" size="xs" disabled={isPending || !value.trim()}>
          <Plus className="size-3" aria-hidden="true" />
          Add tag
        </Button>
      </form>
    </div>
  );
}
