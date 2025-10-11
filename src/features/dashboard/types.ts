export interface DashboardRange {
  start: string;
  end: string;
}

export interface SalesOverviewResponse {
  data: {
    range: DashboardRange;
    totalSales: number;
    totalSalesPrevious: number;
    deltaPercent: number | null;
    totalOrders: number;
    totalOrdersPrevious: number;
    ordersDeltaPercent: number | null;
    newCustomers: number;
    newCustomersPrevious: number;
    customersDeltaPercent: number | null;
  };
}

export interface SalesSeriesResponse {
  data: {
    range: DashboardRange;
    points: Array<{ date: string; value: number }>;
  };
}

export interface OrdersStatusResponse {
  data: {
    range: DashboardRange;
    statuses: Array<{ status: string; count: number }>;
  };
}

export interface LoyaltySummaryResponse {
  data: {
    range: DashboardRange;
    pointsIssued: number;
    pointsRedeemed: number;
    outstandingBalance: number;
  };
}

export interface TopProductsResponse {
  data: {
    range: DashboardRange;
    products: Array<{ productId: string; name: string; revenue: number; quantity: number }>;
  };
}
