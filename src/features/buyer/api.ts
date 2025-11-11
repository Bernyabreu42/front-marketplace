import { apiFetch } from "@/api/client";

import type {
  AddressMessageResponse,
  FavoriteMessageResponse,
  FavoritesQuery,
  FavoritesResponse,
  LoyaltyAccountResponse,
  OrderResponse,
  OrdersQuery,
  OrdersResponse,
  UserAddressPayload,
  UserAddressesResponse,
  UserAddressResponse,
} from "./types";

export const fetchMyOrders = (params: OrdersQuery) =>
  apiFetch<OrdersResponse>("/api/orders/my", { query: params });

export const fetchOrderById = (orderId: string) =>
  apiFetch<OrderResponse>(`/api/orders/${orderId}`);

export const fetchLoyaltyAccount = (params?: { limit?: number }) =>
  apiFetch<LoyaltyAccountResponse>("/api/loyalty/accounts/me", {
    query: params,
  });

export const fetchFavorites = (params?: FavoritesQuery) =>
  apiFetch<FavoritesResponse>("/api/favorites", { query: params as any });

export const removeFavorite = (productId: string) =>
  apiFetch<FavoriteMessageResponse>(`/api/favorites/${productId}`, {
    method: "DELETE",
  });

export const fetchAddresses = () =>
  apiFetch<UserAddressesResponse>("/api/addresses");

export const createAddress = (payload: UserAddressPayload) =>
  apiFetch<UserAddressResponse>("/api/addresses", {
    method: "POST",
    body: payload,
  });

export const updateAddress = (
  addressId: string,
  payload: UserAddressPayload
) =>
  apiFetch<UserAddressResponse>(`/api/addresses/${addressId}`, {
    method: "PATCH",
    body: payload,
  });

export const deleteAddress = (addressId: string) =>
  apiFetch<AddressMessageResponse>(`/api/addresses/${addressId}`, {
    method: "DELETE",
  });
