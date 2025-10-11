import { useQuery } from "@tanstack/react-query";

import {
  fetchCategories,
  fetchStoreDetails,
  fetchStoreDiscounts,
  fetchStoreOrders,
  fetchStoreProducts,
  fetchStorePromotions,
  fetchStoreShippingMethods,
  fetchStoreTaxes,
} from "./api";
import type {
  ApiResponse,
  CategoriesResponse,
  DiscountsQuery,
  DiscountsResponse,
  OrdersQuery,
  ProductsQuery,
  ProductsResponse,
  PromotionsQuery,
  PromotionsResponse,
  SellerOrdersResponse,
  ShippingMethod,
  StoreDetail,
  TaxesQuery,
  TaxesResponse,
} from "./types";

const queryKey = (...parts: unknown[]) => ["seller", ...parts];

export const useSellerStore = (storeId?: string) =>
  useQuery<ApiResponse<StoreDetail>>({
    queryKey: queryKey("store", storeId),
    queryFn: () => fetchStoreDetails(storeId!),
    enabled: Boolean(storeId),
    staleTime: 30_000,
  });

export const useStoreOrders = (storeId?: string, params?: OrdersQuery) =>
  useQuery<SellerOrdersResponse>({
    queryKey: queryKey("orders", storeId, params),
    queryFn: () => fetchStoreOrders(params ?? {}),
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });

export const useStoreProducts = (storeId?: string, params?: ProductsQuery) =>
  useQuery<ProductsResponse>({
    queryKey: queryKey("products", storeId, params),
    queryFn: () => fetchStoreProducts(storeId!, params ?? {}),
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });

export const useStorePromotions = (storeId?: string, params?: PromotionsQuery) =>
  useQuery<PromotionsResponse>({
    queryKey: queryKey("promotions", storeId, params),
    queryFn: () => fetchStorePromotions(storeId!, params ?? {}),
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });

export const useStoreDiscounts = (storeId?: string, params?: DiscountsQuery) =>
  useQuery<DiscountsResponse>({
    queryKey: queryKey("discounts", storeId, params),
    queryFn: () => fetchStoreDiscounts(storeId!, params ?? {}),
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });

export const useStoreTaxes = (storeId?: string, params?: TaxesQuery) =>
  useQuery<TaxesResponse>({
    queryKey: queryKey("taxes", storeId, params),
    queryFn: () => fetchStoreTaxes(storeId!, params ?? {}),
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });

export const useStoreShippingMethods = (storeId?: string) =>
  useQuery<ApiResponse<ShippingMethod[]>>({
    queryKey: queryKey("shipping-methods", storeId),
    queryFn: () => fetchStoreShippingMethods(storeId!),
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });

export const useCategories = (params?: { page?: number; limit?: number }) =>
  useQuery<CategoriesResponse>({
    queryKey: queryKey("categories", params),
    queryFn: () => fetchCategories(params),
    staleTime: 60_000,
  });
