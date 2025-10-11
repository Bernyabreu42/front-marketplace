import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client";
import {
  type ApiResponse,
  type CategorySummary,
  type DiscountItem,
  type ProductListItem,
  type PromotionItem,
  type TaxItem,
} from "@/features/seller/types";
import {
  fetchCategories,
  fetchStoreDiscounts,
  fetchStorePromotions,
  fetchStoreTaxes,
} from "@/features/seller/api";

export function useEditProduct(productId?: string) {
  const [isFetching, setFetching] = useState(true);
  const [product, setProduct] = useState<ProductListItem | null>(null);
  const [related, setRelated] = useState<ProductListItem[]>([]);
  const [availableTaxes, setAvailableTaxes] = useState<TaxItem[]>([]);
  const [availableDiscounts, setAvailableDiscounts] = useState<DiscountItem[]>(
    []
  );
  const [availablePromotions, setAvailablePromotions] = useState<
    PromotionItem[]
  >([]);
  const [availableCategories, setAvailableCategories] = useState<
    CategorySummary[]
  >([]);

  useEffect(() => {
    if (!productId) {
      setFetching(false);
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      try {
        setFetching(true);
        const [productResponse, relatedResponse] = await Promise.all([
          apiFetch<ApiResponse<ProductListItem>>(`/api/products/${productId}`),
          apiFetch<ApiResponse<ProductListItem[]>>(
            `/api/products/${productId}/related`
          ),
        ]);

        if (isCancelled) return;

        if (productResponse.success && productResponse.data) {
          setProduct(productResponse.data);
          setRelated(relatedResponse.data ?? []);
        } else {
          // Handle case where product is not found
          setProduct(null);
          setRelated([]);
          setAvailableTaxes([]);
          setAvailableDiscounts([]);
          setAvailablePromotions([]);
        }
      } catch (error) {
        console.error("Failed to fetch product data:", error);
        if (!isCancelled) {
          setProduct(null);
          setRelated([]);
          setAvailableTaxes([]);
          setAvailableDiscounts([]);
          setAvailablePromotions([]);
        }
      } finally {
        if (!isCancelled) {
          setFetching(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [productId]);

  // Fetch store-level catalogs once the product data is available
  useEffect(() => {
    if (!product?.storeId) return;

    let isCancelled = false;

    const loadCatalogData = async () => {
      try {
        const [taxesResponse, discountsResponse, promotionsResponse] =
          await Promise.all([
            fetchStoreTaxes(product.storeId, { limit: 100, status: "active" }),
            fetchStoreDiscounts(product.storeId, {
              limit: 100,
              status: "active",
            }),
            fetchStorePromotions(product.storeId, {
              limit: 100,
              status: "active",
            }),
          ]);

        if (isCancelled) return;

        if (taxesResponse.success) {
          const activeTaxes = (taxesResponse.data ?? []).filter(
            (tax) => tax.status === "active"
          );
          setAvailableTaxes(activeTaxes);
        }

        if (discountsResponse.success) {
          const activeDiscounts = (discountsResponse.data ?? []).filter(
            (discount) => discount.status === "active"
          );
          setAvailableDiscounts(activeDiscounts);
        }

        if (promotionsResponse.success) {
          const activePromotions = (promotionsResponse.data ?? []).filter(
            (promotion) => promotion.status === "active"
          );
          setAvailablePromotions(activePromotions);
        }
      } catch (error) {
        console.error("Failed to fetch product catalogs:", error);
      }
    };

    loadCatalogData();

    return () => {
      isCancelled = true;
    };
  }, [product?.storeId]);

  // Fetch all categories
  useEffect(() => {
    let isCancelled = false;

    const loadCategories = async () => {
      try {
        const response = await fetchCategories({ limit: 500 });
        if (!isCancelled && response.success) {
          setAvailableCategories(response.data ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    loadCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    isFetching,
    product,
    related,
    setRelated,
    availableCategories,
    availablePromotions,
    availableDiscounts,
    availableTaxes,
  };
}
