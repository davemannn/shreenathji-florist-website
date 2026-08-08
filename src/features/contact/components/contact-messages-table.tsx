"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, MailOpen, Trash2 } from "lucide-react";
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
import { deleteContactMessageAction, setContactMessageReadAction } from "../actions";
import type { AdminContactMessage } from "../types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ContactMessagesTable({ messages }: { messages: AdminContactMessage[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleRead(message: AdminContactMessage) {
    startTransition(async () => {
      try {
        await setContactMessageReadAction(message.id, !message.isRead);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update this message.");
      }
    });
  }

  function handleDelete(message: AdminContactMessage) {
    if (!window.confirm(`Delete the message from "${message.name}"? This can't be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteContactMessageAction(message.id);
        toast.success("Message deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this message.");
      }
    });
  }

  if (messages.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No messages yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>From</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Received</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => (
          <TableRow key={message.id} className={message.isRead ? "opacity-70" : undefined}>
            <TableCell>
              <div className="flex items-center gap-2">
                {!message.isRead ? <Badge variant="secondary">New</Badge> : null}
                <div>
                  <p className="font-medium">{message.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {message.email}
                    {message.phone ? ` · ${message.phone}` : ""}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="max-w-md text-sm">{message.message}</TableCell>
            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
              {formatDateTime(message.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggleRead(message)}
                >
                  {message.isRead ? (
                    <Mail className="size-3.5" aria-hidden="true" />
                  ) : (
                    <MailOpen className="size-3.5" aria-hidden="true" />
                  )}
                  {message.isRead ? "Mark unread" : "Mark read"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(message)}
                  aria-label={`Delete message from ${message.name}`}
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
