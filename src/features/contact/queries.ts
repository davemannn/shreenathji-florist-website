import {
  listContactMessagesAdmin as listContactMessagesAdminRepo,
  type ListContactMessagesAdminParams,
} from "@/server/repositories/contact-message.repository";
import type { AdminContactMessage } from "./types";

export interface AdminContactMessagesResult {
  messages: AdminContactMessage[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
}

export async function listContactMessagesAdmin(
  params: ListContactMessagesAdminParams = {},
): Promise<AdminContactMessagesResult> {
  const { messages, total, unreadCount, page, pageSize } =
    await listContactMessagesAdminRepo(params);
  return {
    messages: messages.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone ?? undefined,
      message: m.message,
      isRead: m.isRead,
      createdAt: m.createdAt.toISOString(),
    })),
    total,
    unreadCount,
    page,
    pageSize,
  };
}
