import { useQuery } from "@tanstack/react-query";

import {
  fetchLoyaltySummary,
  fetchOrdersStatus,
  fetchSalesOverview,
  fetchSalesSeries,
  fetchTopProducts,
} from "./api";
import type { RangeParams } from "./api";

const queryKey = (key: string, params: RangeParams | (RangeParams & { limit?: number })) => ["dashboard", key, params];

export const useSalesOverview = (params: RangeParams) =>
  useQuery({
    queryKey: queryKey("overview", params),
    queryFn: () => fetchSalesOverview(params),
  });

export const useSalesSeries = (params: RangeParams) =>
  useQuery({
    queryKey: queryKey("series", params),
    queryFn: () => fetchSalesSeries(params),
  });

export const useOrdersStatus = (params: RangeParams) =>
  useQuery({
    queryKey: queryKey("orders-status", params),
    queryFn: () => fetchOrdersStatus(params),
  });

export const useLoyaltySummary = (params: RangeParams) =>
  useQuery({
    queryKey: queryKey("loyalty", params),
    queryFn: () => fetchLoyaltySummary(params),
  });

export const useTopProducts = (params: RangeParams & { limit?: number }) =>
  useQuery({
    queryKey: queryKey("top-products", params),
    queryFn: () => fetchTopProducts(params),
  });
