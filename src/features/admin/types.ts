import type {
  CategoriesResponse,
  CategorySummary,
  StoreAddressValue,
  StoreBusinessHoursValue,
  TaxesResponse,
  TaxItem,
} from "@/features/seller/types";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  next: boolean;
  prev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  username: string | null;
  phone: string | null;
  status: string;
  role: string;
  isOnline: boolean;
  emailVerified: boolean;
  lastLogin: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
  profileImage: string | null;
}

export interface AdminStoreOwner {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}

export interface AdminStoreSummary {
  id: string;
  name: string;
  tagline: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  owner: AdminStoreOwner;
  address: StoreAddressValue;
  email: string | null;
  phone: string | null;
  _count?: {
    products: number;
    reviews: number;
  } | null;
}

export interface AdminStoreDetail extends AdminStoreSummary {
  description: string;
  averageRating?: number | null;
  activeProducts?: number | null;
  website: string | null;
  logo: string | null;
  banner: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  keywords: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  businessHours?: StoreBusinessHoursValue;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFinal: number;
  stock: number;
  status: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminUsersResponse = PaginatedResponse<AdminUser>;
export type AdminStoresResponse = PaginatedResponse<AdminStoreSummary>;
export type AdminProductsResponse = PaginatedResponse<AdminProduct>;
export type AdminCategoriesResponse = CategoriesResponse;
export type AdminCategory = CategorySummary;

export type AdminTax = TaxItem;
export type AdminTaxesResponse = TaxesResponse;

export type AdminOrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled";

export interface AdminOrderStore {
  id: string;
  name: string;
}

export interface AdminOrderUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface AdminOrderItemProduct {
  id: string;
  name: string;
  price: number;
  priceFinal: number;
  images: string[];
}

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  product?: AdminOrderItemProduct;
}

export interface AdminOrder {
  id: string;
  userId: string;
  storeId: string;
  status: AdminOrderStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  promotionAmount: number;
  total: number;
  shippingAddress?: Record<string, unknown> | null;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  promotionId?: string | null;
  discountId?: string | null;
  createdAt: string;
  updatedAt: string;
  store?: AdminOrderStore;
  user?: AdminOrderUser;
  items: AdminOrderItem[];
}

export type AdminOrdersResponse = PaginatedResponse<AdminOrder>;
export type AdminOrderResponse = ApiResponse<AdminOrder>;
