import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, HeartOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "./hooks";
import { removeFavorite } from "./api";
import { getApiErrorMessage } from "@/lib/utils";
import { useImageUrlResolver } from "@/hooks/use-image-url";
import type { FavoriteItem, FavoriteMessageResponse } from "./types";

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
});

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
});

const PAGE_SIZE = 12;

type RemoveFavoriteInput = {
  productId: string;
  productName?: string | null;
};

export function BuyerFavoritesPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const resolveImageUrl = useImageUrlResolver();

  const params = useMemo(() => ({ page, limit: PAGE_SIZE }), [page]);
  const { data, isLoading, isFetching } = useFavorites(params);

  const favorites = data?.data ?? [];
  const pagination = data?.pagination;

  const removeMutation = useMutation<
    FavoriteMessageResponse,
    unknown,
    RemoveFavoriteInput
  >({
    mutationFn: ({ productId }: RemoveFavoriteInput) => removeFavorite(productId),
    onSuccess: (_response, variables) => {
      const label = variables?.productName
        ? `${variables.productName} se elimino de tus favoritos.`
        : "Producto eliminado de favoritos.";
      toast.success(label);
      queryClient
        .invalidateQueries({ queryKey: ["buyer", "favorites"] })
        .catch(() => undefined);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const canPrev = Boolean(pagination?.prev) && !isFetching;
  const canNext = Boolean(pagination?.next) && !isFetching;

  const renderProductCard = (favorite: FavoriteItem) => {
    const product = favorite.product;
    const imageUrl = resolveImageUrl(product?.images?.[0]);
    const price = product ? product.priceFinal ?? product.price : null;
    const addedAt = dateFormatter.format(new Date(favorite.createdAt));
    const isRemoving =
      removeMutation.isPending &&
      removeMutation.variables?.productId === favorite.productId;

    return (
      <Card key={favorite.id} className="h-full">
        <CardContent className="flex h-full gap-4 p-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product?.name ?? "Producto favorito"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold leading-tight text-foreground">
                  {product?.name ?? "Producto no disponible"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product?.store?.name ?? "Tienda no disponible"}
                </p>
              </div>
              {product?.status && (
                <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">
                  {product.status}
                </Badge>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {price !== null ? money.format(price) : "No disponible"}
                </p>
                <p className="text-xs text-muted-foreground">Agregado el {addedAt}</p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Heart className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium">
                  {product?.favoritesCount ?? 0}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  removeMutation.mutate({
                    productId: favorite.productId,
                    productName: product?.name,
                  })
                }
                disabled={isRemoving}
              >
                {isRemoving ? "Quitando..." : "Quitar favorito"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mis favoritos</h1>
        <p className="text-sm text-muted-foreground">
          Guarda los productos que te interesan para revisarlos mas adelante.
        </p>
             {typeof pagination?.total === "number" && (
            <p className="text-sm text-muted-foreground">
              {pagination.total} producto{pagination.total === 1 ? "" : "s"}
            </p>
          )}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">Productos favoritos</CardTitle>
          {typeof pagination?.total === "number" && (
            <p className="text-sm text-muted-foreground">
              {pagination.total} producto{pagination.total === 1 ? "" : "s"}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando favoritos...</p>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8 text-center">
              <HeartOff className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">Aun no tienes productos favoritos</p>
                <p className="text-sm text-muted-foreground">
                  Explora las tiendas y pulsa el icono de corazon para guardarlos aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 ">
              {favorites.map(renderProductCard)}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Pagina {pagination?.page ?? page} de {pagination?.totalPages ?? 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!canPrev}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!canNext}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
