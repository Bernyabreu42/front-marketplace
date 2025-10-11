import { apiFetch } from "@/api/client";
import type {
  AdminCategory,
  AdminCategoriesResponse,
  AdminOrderResponse,
  AdminOrdersResponse,
  AdminProductsResponse,
  AdminStoreDetail,
  AdminStoresResponse,
  AdminTaxesResponse,
  AdminUser,
  AdminUsersResponse,
  AdminOrderStatus,
  ApiResponse,
} from "./types";

export const fetchAdminUsers = (params: { page?: number; limit?: number }) =>
  apiFetch<AdminUsersResponse>("/api/users", { query: params });

export const fetchAdminUser = (userId: string) =>
  apiFetch<ApiResponse<AdminUser>>(`/api/users/${userId}`);

export const updateAdminUser = (
  userId: string,
  payload: Partial<
    Pick<
      AdminUser,
      | "firstName"
      | "lastName"
      | "displayName"
      | "username"
      | "phone"
      | "role"
      | "status"
    >
  >
) =>
  apiFetch<ApiResponse<AdminUser>>(`/api/users/update/${userId}`, {
    method: "PATCH",
    body: payload,
  });

export const fetchAdminStores = (params: {
  page?: number;
  limit?: number;
  status?: string;
}) => apiFetch<AdminStoresResponse>("/api/stores/all", { query: params });

export const updateStoreStatus = (storeId: string, status: string) =>
  apiFetch<ApiResponse<AdminStoreDetail>>(`/api/stores/${storeId}/status`, {
    method: "PATCH",
    body: { status },
  });

export const deleteAdminStore = (storeId: string) =>
  apiFetch<ApiResponse<{ id: string }>>(`/api/stores/${storeId}`, {
    method: "DELETE",
  });

export const fetchAdminStore = (storeId: string) =>
  apiFetch<ApiResponse<AdminStoreDetail>>(`/api/stores/${storeId}`);

export const fetchAdminProducts = (params: {
  page?: number;
  limit?: number;
  storeId?: string;
}) => apiFetch<AdminProductsResponse>("/api/products", { query: params });

export const fetchAdminCategories = (params?: {
  page?: number;
  limit?: number;
}) => apiFetch<AdminCategoriesResponse>("/api/categories", { query: params });

export const fetchAdminCategory = (categoryId: string) =>
  apiFetch<ApiResponse<AdminCategory>>(`/api/categories/${categoryId}`);

export const createCategory = (payload: { name: string; slug: string }) =>
  apiFetch<ApiResponse<{ id: string }>>("/api/categories", {
    method: "POST",
    body: payload,
  });

export const updateCategory = (
  categoryId: string,
  payload: Partial<Pick<AdminCategory, "name" | "slug">>
) =>
  apiFetch<ApiResponse<AdminCategory>>(`/api/categories/${categoryId}`, {
    method: "PATCH",
    body: payload,
  });


export const fetchAdminTaxes = (params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  storeId?: string;
}) => apiFetch<AdminTaxesResponse>("/api/taxes", { query: params });

export const fetchAdminOrder = (orderId: string) =>
  apiFetch<AdminOrderResponse>(`/api/orders/${orderId}`);

export const fetchAdminOrders = (params?: {
  page?: number;
  limit?: number;
  status?: AdminOrderStatus;
  storeId?: string;
  userId?: string;
}) => apiFetch<AdminOrdersResponse>("/api/orders", { query: params });

export const updateAdminOrderStatus = (
  orderId: string,
  status: AdminOrderStatus
) =>
  apiFetch<AdminOrderResponse>(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: { status },
  });

