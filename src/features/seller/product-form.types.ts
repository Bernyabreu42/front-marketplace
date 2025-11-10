export type ProductFormState = {
  name: string;
  sku: string;
  price: string;
  stock: string;
  status: string;
  categories: string[];
  taxes: string[];
  promotionIds: string[];
  discountId: string | null;
  metaTitle: string;
  metaDescription: string;
};

export type PricePreviewStep = {
  id: string;
  label: string;
  change: number;
  total: number;
  kind: "base" | "promotion" | "discount" | "tax" | "total";
  detail?: string;
};
