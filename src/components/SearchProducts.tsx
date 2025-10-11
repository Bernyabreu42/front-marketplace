import React, { useState } from "react";
import { apiFetch } from "@/api/client";
import type { ProductListItem } from "@/features/seller/types";
import { useAuth } from "@/auth/AuthContext";
import { SearchSelector } from "./search-select";
import type { PaginatedResponse } from "@/features/users/types";
import { money } from "@/features/seller/constants";

interface SearchProductsProps {
  onSelect?: (item: ProductListItem) => void;
  excludeIds?: string[];
  urlPath?: string;
  RenderExtraItems?: (item: ProductListItem) => React.JSX.Element;
}

export default function SearchProducts({
  onSelect,
  excludeIds = [],
  urlPath,
  RenderExtraItems,
}: SearchProductsProps) {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPagination, setSearchPagination] =
    useState<PaginatedResponse<unknown>["pagination"]>();

  const searchProducts = async (query: string, page = 1) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const url = urlPath ?? `/api/products/store/${user?.store?.id}`;

      const response = await apiFetch<PaginatedResponse<ProductListItem>>(url, {
        query: { name: query, page, limit: 5 },
      });

      if (response.success && Array.isArray(response.data)) {
        const excludeSet = new Set(excludeIds ?? []);
        const filteredResults = response.data.filter(
          (item) => !excludeSet.has(item.id)
        );
        setSearchResults((prev) =>
          page > 1 ? [...prev, ...filteredResults] : filteredResults
        );
        if (response.pagination) setSearchPagination(response.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreSearch = () => {
    if (searchPagination?.next) {
      searchProducts(searchQuery, searchPagination.page + 1);
    }
  };

  return (
    <>
      <SearchSelector<ProductListItem>
        data={searchResults}
        pagination={searchPagination}
        isLoading={isSearching}
        query={searchQuery}
        onQueryChange={(q) => {
          setSearchQuery(q);
          searchProducts(q, 1);
        }}
        onLoadMore={loadMoreSearch}
        getItemKey={(item) => item.id}
        renderItem={(item) => (
          <div
            key={item.id}
            className="p-2 flex items-center justify-between gap-2"
          >
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">
                <strong>Sku</strong>: {item.sku || "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                <strong>Inventario</strong>: {item.stock || "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                <strong>Categorias</strong>:{" "}
                {item.categories.map((cat) => cat.name).join(", ") || "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                <strong>Precio</strong>: {money.format(item.priceFinal) || "—"}
              </span>
            </div>
            {RenderExtraItems && RenderExtraItems(item)}
          </div>
        )}
        onItemSelect={(item) => {
          if (excludeIds.includes(item.id)) {
            return;
          }
          onSelect?.(item);
        }}
        placeholder="Buscar productos..."
        minQueryLength={1}
      />
    </>
  );
}
