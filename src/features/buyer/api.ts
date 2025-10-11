import { apiFetch } from "@/api/client";

import type {
  LoyaltyAccountResponse,
  OrderResponse,
  OrdersQuery,
  OrdersResponse,
} from "./types";

export const fetchMyOrders = (params: OrdersQuery) =>
  apiFetch<OrdersResponse>("/api/orders/my", { query: params });

export const fetchOrderById = (orderId: string) =>
  apiFetch<OrderResponse>(`/api/orders/${orderId}`);

export const fetchLoyaltyAccount = (params?: { limit?: number }) =>
  apiFetch<LoyaltyAccountResponse>("/api/loyalty/accounts/me", {
    query: params,
  });
