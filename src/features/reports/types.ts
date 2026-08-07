export interface SalesReportRow {
  period: string;
  orders: number;
  revenue: number;
}

export interface SalesReport {
  rows: SalesReportRow[];
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface TaxRateBreakdownRow {
  gstRate: number;
  taxableValue: number;
  taxAmount: number;
}

export interface TaxReport {
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  byRate: TaxRateBreakdownRow[];
}

export interface ProductReportRow {
  productTitle: string;
  unitsSold: number;
  revenue: number;
  orderCount: number;
}

export interface CustomerReportRow {
  customerName: string;
  customerEmail: string;
  ordersInRange: number;
  totalSpentInRange: number;
  isNewCustomer: boolean;
  lifetimeOrderCount: number;
}

export interface CustomerReport {
  rows: CustomerReportRow[];
  newCustomerCount: number;
  repeatCustomerCount: number;
}
