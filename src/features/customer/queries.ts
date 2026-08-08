import {
  findCustomerByIdAdmin,
  getCustomerOrderStats,
  listCustomersAdmin as listCustomersAdminRepo,
  type ListCustomersAdminParams,
} from "@/server/repositories/user.repository";
import { computeCustomerSegment } from "./segment";
import type { AdminCustomerDetail, AdminCustomerListItem } from "./types";

export interface AdminCustomerListResult {
  customers: AdminCustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listCustomersAdmin(
  params: ListCustomersAdminParams = {},
): Promise<AdminCustomerListResult> {
  const { users, total, page, pageSize } = await listCustomersAdminRepo(params);
  const stats = await getCustomerOrderStats(users.map((u) => u.id));

  const customers = users.map((user) => {
    const userStats = stats.get(user.id) ?? {
      lifetimeSpent: 0,
      lifetimeOrderCount: 0,
      lastOrderAt: null,
    };
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? undefined,
      joinedAt: user.createdAt.toISOString(),
      lifetimeSpent: userStats.lifetimeSpent,
      lifetimeOrderCount: userStats.lifetimeOrderCount,
      segment: computeCustomerSegment(userStats),
      tags: user.tags.map((t) => t.label),
    };
  });

  return { customers, total, page, pageSize };
}

export async function getCustomerForAdmin(id: string): Promise<AdminCustomerDetail | null> {
  const user = await findCustomerByIdAdmin(id);
  if (!user) return null;

  const stats = await getCustomerOrderStats([id]);
  const userStats = stats.get(id) ?? { lifetimeSpent: 0, lifetimeOrderCount: 0, lastOrderAt: null };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    walletBalance: user.walletBalance,
    joinedAt: user.createdAt.toISOString(),
    lifetimeSpent: userStats.lifetimeSpent,
    lifetimeOrderCount: userStats.lifetimeOrderCount,
    segment: computeCustomerSegment(userStats),
    tags: user.tags.map((t) => ({ id: t.id, label: t.label })),
    addresses: user.addresses.map((a) => ({
      id: a.id,
      label: a.label ?? undefined,
      line1: a.line1,
      city: a.city,
      state: a.state,
      isDefault: a.isDefault,
    })),
    recentOrders: user.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: o.createdAt.toISOString(),
    })),
  };
}
