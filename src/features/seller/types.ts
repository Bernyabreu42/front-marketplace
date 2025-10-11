import type {
  ApiResponse as BaseApiResponse,
  PaginatedResponse,
} from "@/features/users/types";

export type ApiResponse<T> = BaseApiResponse<T>;

export type StoreBusinessDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface StoreBusinessHourEntry {
  open: string;
  close: string;
  closed?: boolean | null;
}

export interface PriceAdjustmentsType {
  name: string;
  type: string;
  amount: number;
}

export type StoreBusinessHoursRecord = Record<
  StoreBusinessDay,
  StoreBusinessHourEntry
>;
export type StoreBusinessHoursValue =
  | StoreBusinessHoursRecord
  | StoreBusinessHourEntry[]
  | null;

export interface StoreOwnerSummary {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export interface StoreDetail {
  id: string;
  name: string;
  tagline: string | null;
  description: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  logo: string | null;
  banner: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  status: string;
  keywords: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  businessHours: StoreBusinessHoursValue;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: StoreOwnerSummary | null;
  _count?: {
    products: number;
    reviews: number;
  } | null;
}

export interface CreateStorePayload {
  name: string;
  description: string;
  tagline?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  description: string;
  sku: string | null;
  price: number;
  priceFinal: number;
  stock: number;
  status: string;
  images: string[];
  storeId: string;
  createdAt: string;
  updatedAt: string;
  categories: CategorySummary[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  taxes?: TaxItem[];
  promotions?: PromotionItem[];
  discountId?: string | null;
}

export type ProductsResponse = PaginatedResponse<ProductListItem>;

export interface PromotionItem {
  id: string;
  name: string;
  description: string | null;
  type: "automatic" | "coupon";
  value: number | null;
  code: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export type PromotionsResponse = PaginatedResponse<PromotionItem>;

export interface DiscountItem {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  description: string | null;
  status: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export type DiscountsResponse = PaginatedResponse<DiscountItem>;

export interface TaxItem {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  rate: number;
  description: string | null;
  status: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export type TaxesResponse = PaginatedResponse<TaxItem>;

export type CategoriesResponse = PaginatedResponse<CategorySummary>;

export interface ProductsQuery {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface PromotionsQuery {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface DiscountsQuery {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface TaxesQuery {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  q?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  priceFinal: number;
  stock: number;
  storeId: string;
  categories: string[];
  images: string[];
  sku?: string | null;
  status?: string;
  taxes?: string[];
  promotionIds?: string[];
  discountId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  related?: string[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface CreatePromotionPayload {
  name: string;
  description?: string | null;
  type: "automatic" | "coupon";
  value?: number | null;
  code?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: string;
}

export interface UpdatePromotionPayload
  extends Partial<CreatePromotionPayload> {}

export interface CreateDiscountPayload {
  name: string;
  type: "percentage" | "fixed";
  value: number;
  description?: string | null;
  status?: string;
}

export interface UpdateDiscountPayload extends Partial<CreateDiscountPayload> {}

export interface CreateTaxPayload {
  name: string;
  type: "percentage" | "fixed";
  rate: number;
  description?: string | null;
  status?: string;
}

export interface UpdateTaxPayload extends Partial<CreateTaxPayload> {}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export type ShippingMethodsResponse = PaginatedResponse<ShippingMethod>;

export interface CreateShippingMethodPayload {
  name: string;
  price: number;
  description?: string | null;
}

export interface UpdateShippingMethodPayload
  extends Partial<CreateShippingMethodPayload> {}

export interface ShippingQuery {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled";

export interface OrderItemProduct {
  id: string;
  name: string;
  price: number;
  priceFinal: number;
  images: string[];
}

export interface OrderItem {
  id: string;
  lineDiscount: number;
  lineSubtotal: number;
  orderId: string;
  productId: string;
  product?: OrderItemProduct;
  quantity: number;
  unitPrice: number;
  unitPriceFinal: number;
}

export interface OrderUserSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface SellerOrder {
  id: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  promotionAmount: number;
  total: number;
  totalDiscountAmount: number;
  priceAdjustments: PriceAdjustmentsType[];
  shippingAddress?: Record<string, unknown> | null;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  promotionId?: string | null;
  discountId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: OrderUserSummary | null;
  items: OrderItem[];
}

export type SellerOrdersResponse = PaginatedResponse<SellerOrder>;
export type SellerOrderResponse = ApiResponse<SellerOrder>;
