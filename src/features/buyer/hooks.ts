import { useQuery } from "@tanstack/react-query";

import { fetchLoyaltyAccount, fetchMyOrders } from "./api";
import type {
  LoyaltyAccountResponse,
  OrdersQuery,
  OrdersResponse,
} from "./types";

const queryKey = (resource: string, params: unknown) => [
  "buyer",
  resource,
  params,
];

export const useMyOrders = (params: OrdersQuery) =>
  useQuery<OrdersResponse>({
    queryKey: queryKey("orders", params),
    queryFn: () => fetchMyOrders(params),
    staleTime: 30_000,
  });

export const useLoyaltyAccount = (params?: { limit?: number }) =>
  useQuery<LoyaltyAccountResponse>({
    queryKey: queryKey("loyalty", params ?? {}),
    queryFn: () => fetchLoyaltyAccount(params),
    staleTime: 30_000,
  });
