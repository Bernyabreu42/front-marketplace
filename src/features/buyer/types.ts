import type { ApiResponse, PaginatedResponse } from "@/features/users/types";

export interface OrderProduct {
  sku: any;
  id: string;
  name: string;
  price: number;
  priceFinal: number;
  images: string[];
}

export interface OrderItem {
  productId: string;
  unitPrice: any;
  unitPriceFinal: any;
  id: string;
  quantity: number;
  product: OrderProduct;
}

export interface OrderStore {
  id: string;
  name: string | null;
  ownerId: string;
}

export interface OrderSummary {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  store: OrderStore | null;
  items: OrderItem[];
}

export type OrdersResponse = PaginatedResponse<OrderSummary>;

export interface OrderUser {
  phone: string;
  id: string;
  firstName: string | null;
  email: string;
}

export interface Order {
  shippingAmount: number;
  taxAmount: number;
  totalDiscountAmount: number;
  subtotal: number | bigint;
  shippingAddress: {};
  id: string;
  userId: string;
  storeId: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  store: OrderStore | null;
  user: OrderUser;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}


export interface LoyaltyAccount {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyAction {
  id: string;
  key: string;
  name: string;
  description: string | null;
  defaultPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  accountId: string;
  userId: string;
  points: number;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  metadata?: unknown;
  actionId?: string | null;
  action?: LoyaltyAction | null;
  createdAt: string;
}

export interface LoyaltyAccountPayload {
  account: LoyaltyAccount;
  transactions: LoyaltyTransaction[];
  redeemablePoints: number;
  redeemableAmount: number;
}

export interface LoyaltyAccountResponse {
  success: boolean;
  message: string;
  data: LoyaltyAccountPayload;
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface FavoriteProductStore {
  id: string;
  name: string | null;
  status: string;
  isDeleted?: boolean;
}

export interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  priceFinal: number;
  images: string[];
  status: string;
  favoritesCount: number;
  isFavorite?: boolean;
  store: FavoriteProductStore | null;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: FavoriteProduct | null;
}

export type FavoritesResponse = PaginatedResponse<FavoriteItem>;

export interface FavoritesQuery {
  page?: number;
  limit?: number;
}

export interface FavoriteMessageResponse {
  success: boolean;
  message: string;
}


export interface ShippingAddress {
  country?: string | null;
  state?: string | null;
  city?: string | null;
  postalCode?: string | null;
  street?: string | null;
  note?: string | null;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string | null;
  isDefault: boolean;
  address: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddressPayload extends ShippingAddress {
  label?: string | null;
  isDefault?: boolean;
}

export type UserAddressesResponse = ApiResponse<UserAddress[]>;
export type UserAddressResponse = ApiResponse<UserAddress>;
export interface AddressMessageResponse {
  success: boolean;
  message: string;
}
