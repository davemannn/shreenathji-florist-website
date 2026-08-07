export interface OrderVolumePoint {
  period: string;
  orders: number;
}

export interface StatusBreakdownRow {
  status: string;
  count: number;
}

export interface OperationalDashboard {
  orderVolume: OrderVolumePoint[];
  statusBreakdown: StatusBreakdownRow[];
  totalOrders: number;
  /** Average hours from order placed to delivered, for orders delivered in range. Null if none delivered yet. */
  avgFulfillmentHours: number | null;
}

export interface RevenueTrendPoint {
  period: string;
  revenue: number;
}

export interface TopProductRow {
  productTitle: string;
  revenue: number;
  unitsSold: number;
}

export interface FinancialDashboard {
  revenueTrend: RevenueTrendPoint[];
  totalRevenue: number;
  avgOrderValue: number;
  topProducts: TopProductRow[];
}
