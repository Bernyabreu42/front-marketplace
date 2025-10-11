import { apiFetch } from "@/api/client";
import type {
  LoyaltySummaryResponse,
  OrdersStatusResponse,
  SalesOverviewResponse,
  SalesSeriesResponse,
  TopProductsResponse,
} from "./types";

export interface RangeParams {
  rangeStart?: string;
  rangeEnd?: string;
  days?: number;
  [key: string]: string | number | boolean | undefined;
}

export const fetchSalesOverview = (params: RangeParams) =>
  apiFetch<SalesOverviewResponse>("/api/dashboard/overview", { query: params });

export const fetchSalesSeries = (params: RangeParams) =>
  apiFetch<SalesSeriesResponse>("/api/dashboard/sales", { query: params });

export const fetchOrdersStatus = (params: RangeParams) =>
  apiFetch<OrdersStatusResponse>("/api/dashboard/orders/status", { query: params });

export const fetchLoyaltySummary = (params: RangeParams) =>
  apiFetch<LoyaltySummaryResponse>("/api/dashboard/loyalty", { query: params });

export const fetchTopProducts = (params: RangeParams & { limit?: number }) =>
  apiFetch<TopProductsResponse>("/api/dashboard/top-products", { query: params });
