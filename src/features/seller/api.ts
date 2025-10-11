import { apiFetch } from "@/api/client";

import type {
  ApiResponse,
  CategoriesResponse,
  CreateDiscountPayload,
  CreateProductPayload,
  CreatePromotionPayload,
  CreateShippingMethodPayload,
  CreateTaxPayload,
  DiscountItem,
  DiscountsQuery,
  DiscountsResponse,
  ProductListItem,
  ProductsQuery,
  ProductsResponse,
  PromotionItem,
  PromotionsQuery,
  PromotionsResponse,
  ShippingMethod,
  StoreDetail,
  TaxItem,
  TaxesQuery,
  TaxesResponse,
  UpdateDiscountPayload,
  UpdateProductPayload,
  UpdatePromotionPayload,
  UpdateShippingMethodPayload,
  UpdateTaxPayload,
  CreateStorePayload,
} from "./types";

export const fetchStoreDetails = (storeId: string) =>
  apiFetch<ApiResponse<StoreDetail>>(`/api/stores/${storeId}`);

export const updateStoreDetails = (
  storeId: string,
  payload: Partial<StoreDetail>
) =>
  apiFetch<ApiResponse<StoreDetail>>(`/api/stores/update/${storeId}`, {
    method: "PATCH",
    body: payload,
  });

export const fetchStoreProducts = (storeId: string, params: ProductsQuery) =>
  apiFetch<ProductsResponse>(`/api/products/store/${storeId}`, {
    query: params,
  });

export const createProduct = (payload: CreateProductPayload) =>
  apiFetch<ApiResponse<ProductListItem>>("/api/products", {
    method: "POST",
    body: payload,
  });

export const updateProduct = (
  productId: string,
  payload: UpdateProductPayload
) =>
  apiFetch<ApiResponse<ProductListItem>>(`/api/products/${productId}`, {
    method: "PATCH",
    body: payload,
  });

export const createRelatedProducts = (
  productId: string,
  relatedProductIds: string[]
) =>
  apiFetch<ApiResponse<string[]>>(`/api/products/${productId}/related`, {
    method: "POST",
    body: { relatedProductIds },
  });

export const deleteProduct = (productId: string) =>
  apiFetch<ApiResponse<null>>(`/api/products/${productId}`, {
    method: "DELETE",
  });

export const fetchCategories = (params?: { page?: number; limit?: number }) =>
  apiFetch<CategoriesResponse>("/api/categories", { query: params });

export const fetchStorePromotions = (
  storeId: string,
  params: PromotionsQuery
) =>
  apiFetch<PromotionsResponse>(`/api/promotions/store/${storeId}`, {
    query: params,
  });

export const createPromotion = (payload: CreatePromotionPayload) =>
  apiFetch<ApiResponse<PromotionItem>>("/api/promotions", {
    method: "POST",
    body: payload,
  });

export const updatePromotion = (
  promotionId: string,
  payload: UpdatePromotionPayload
) =>
  apiFetch<ApiResponse<PromotionItem>>(`/api/promotions/${promotionId}`, {
    method: "PATCH",
    body: payload,
  });

export const deletePromotion = (promotionId: string) =>
  apiFetch<ApiResponse<null>>(`/api/promotions/${promotionId}`, {
    method: "DELETE",
  });

export const fetchStoreDiscounts = (storeId: string, params: DiscountsQuery) =>
  apiFetch<DiscountsResponse>(`/api/discounts/store/${storeId}`, {
    query: params,
  });

export const createDiscount = (payload: CreateDiscountPayload) =>
  apiFetch<ApiResponse<DiscountItem>>("/api/discounts", {
    method: "POST",
    body: payload,
  });

export const updateDiscount = (
  discountId: string,
  payload: UpdateDiscountPayload
) =>
  apiFetch<ApiResponse<DiscountItem>>(`/api/discounts/${discountId}`, {
    method: "PATCH",
    body: payload,
  });

export const deleteDiscount = (discountId: string) =>
  apiFetch<ApiResponse<null>>(`/api/discounts/${discountId}`, {
    method: "DELETE",
  });

export const fetchStoreTaxes = (storeId: string, params: TaxesQuery) =>
  apiFetch<TaxesResponse>(`/api/taxes/store/${storeId}`, { query: params });

export const createTax = (payload: CreateTaxPayload) =>
  apiFetch<ApiResponse<TaxItem>>("/api/taxes", {
    method: "POST",
    body: payload,
  });

export const updateTax = (taxId: string, payload: UpdateTaxPayload) =>
  apiFetch<ApiResponse<TaxItem>>(`/api/taxes/${taxId}`, {
    method: "PATCH",
    body: payload,
  });

export const updateStoreImages = (payload: {
  logo?: string;
  banner?: string;
}) =>
  apiFetch<ApiResponse<null>>("/api/stores/update-image", {
    method: "PATCH",
    body: payload,
  });

export const createStore = (payload: CreateStorePayload) =>
  apiFetch<ApiResponse<StoreDetail>>("/api/stores/create", {
    method: "POST",
    body: payload,
  });
export const deleteTax = (taxId: string) =>
  apiFetch<ApiResponse<null>>(`/api/taxes/${taxId}`, {
    method: "DELETE",
  });
export const fetchPromotion = (promotionId: string) =>
  apiFetch<ApiResponse<PromotionItem>>(`/api/promotions/${promotionId}`);

export const fetchDiscount = (discountId: string) =>
  apiFetch<ApiResponse<DiscountItem>>(`/api/discounts/${discountId}`);

export const fetchTax = (taxId: string) =>
  apiFetch<ApiResponse<TaxItem>>(`/api/taxes/${taxId}`);

export const uploadImage = (file: File, folder?: string) => {
  const formData = new FormData();
  formData.append("image", file);
  if (folder) {
    formData.append("folder", folder);
  }

  return apiFetch<ApiResponse<string>>("/api/upload-image/single", {
    method: "POST",
    body: formData,
  });
};

export const fetchRelatedProducts = (productId: string) =>
  apiFetch<ApiResponse<ProductListItem[]>>(
    `/api/products/${productId}/related`
  );

export const fetchProduct = (productId: string) =>
  apiFetch<ApiResponse<ProductListItem>>(`/api/products/${productId}`);

export const fetchStoreShippingMethods = (storeId: string) =>
  apiFetch<ApiResponse<ShippingMethod[]>>(`/api/shipping/store/${storeId}`);

export const fetchShippingMethod = () =>
  apiFetch<ApiResponse<ShippingMethod>>("/api/orders/store");

export const createShippingMethod = (payload: CreateShippingMethodPayload) =>
  apiFetch<ApiResponse<ShippingMethod>>("/api/shipping", {
    method: "POST",
    body: payload,
  });

export const updateShippingMethod = (
  shippingId: string,
  payload: UpdateShippingMethodPayload
) =>
  apiFetch<ApiResponse<ShippingMethod>>(`/api/shipping/${shippingId}`, {
    method: "PATCH",
    body: payload,
  });

export const deleteShippingMethod = (shippingId: string) =>
  apiFetch<ApiResponse<null>>(`/api/shipping/${shippingId}`, {
    method: "DELETE",
  });

export const fetchStoreOrders = (params?: OrdersQuery) =>
  apiFetch<SellerOrdersResponse>("/api/orders/store", { query: params });

export const fetchStoreOrder = (orderId: string) =>
  apiFetch<SellerOrderResponse>(`/api/orders/${orderId}`);

export const updateStoreOrderStatus = (orderId: string, status: OrderStatus) =>
  apiFetch<SellerOrderResponse>(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: { status },
  });
