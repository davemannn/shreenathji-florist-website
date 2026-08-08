import { prisma } from "@/server/db/prisma";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function createContactMessage(input: CreateContactMessageInput) {
  return prisma.contactMessage.create({ data: input });
}

export interface ListContactMessagesAdminParams {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export async function listContactMessagesAdmin(params: ListContactMessagesAdminParams = {}) {
  const { unreadOnly, page = 1, pageSize = 20 } = params;
  const where = unreadOnly ? { isRead: false } : {};

  const [messages, total, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  return { messages, total, unreadCount, page, pageSize };
}

export async function setContactMessageRead(id: string, isRead: boolean) {
  return prisma.contactMessage.update({ where: { id }, data: { isRead } });
}

export async function deleteContactMessage(id: string) {
  return prisma.contactMessage.delete({ where: { id } });
}
