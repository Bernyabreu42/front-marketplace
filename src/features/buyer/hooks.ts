import { useQuery } from "@tanstack/react-query";

import {
  fetchAddresses,
  fetchFavorites,
  fetchLoyaltyAccount,
  fetchMyOrders,
} from "./api";
import type {
  FavoritesQuery,
  FavoritesResponse,
  LoyaltyAccountResponse,
  OrdersQuery,
  OrdersResponse,
  UserAddressesResponse,
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

export const useFavorites = (params?: FavoritesQuery) =>
  useQuery<FavoritesResponse>({
    queryKey: queryKey("favorites", params ?? {}),
    queryFn: () => fetchFavorites(params),
    staleTime: 30_000,
  });

export const useAddresses = () =>
  useQuery<UserAddressesResponse>({
    queryKey: queryKey("addresses", {}),
    queryFn: () => fetchAddresses(),
    staleTime: 30_000,
  });
