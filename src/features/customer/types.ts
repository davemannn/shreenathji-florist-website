import type { CustomerSegment } from "./segment";

export interface AdminCustomerListItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedAt: string;
  lifetimeSpent: number;
  lifetimeOrderCount: number;
  segment: CustomerSegment;
  tags: string[];
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface AdminCustomerDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  walletBalance: number;
  joinedAt: string;
  lifetimeSpent: number;
  lifetimeOrderCount: number;
  segment: CustomerSegment;
  tags: { id: string; label: string }[];
  addresses: {
    id: string;
    label?: string;
    line1: string;
    city: string;
    state: string;
    isDefault: boolean;
  }[];
  recentOrders: CustomerOrderSummary[];
}
