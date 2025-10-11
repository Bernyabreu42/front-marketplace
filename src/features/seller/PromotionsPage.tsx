import type { PromotionItem } from "./types";
import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserById } from "@/features/users/api";
import { deletePromotion } from "./api";
import { useStorePromotions } from "./hooks";

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
});

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  deleted: "outline",
};

export function SellerPromotionsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [page, setPage] = useState(1);

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id;
  const promotionsQuery = useStorePromotions(storeId, { page, limit: 10 });

  const deleteMutation = useMutation({
    mutationFn: (promotionId: string) => deletePromotion(promotionId),
    onSuccess: () => promotionsQuery.refetch(),
  });

  const promotions: PromotionItem[] = promotionsQuery.data?.data ?? [];
  const pagination = promotionsQuery.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Promociones</h1>
          <p className="text-sm text-muted-foreground">
            Define descuentos promocionales para incentivar las ventas de tu tienda.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/seller/promotions/new">Crear promocion</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Promociones registradas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {promotionsQuery.isLoading ? (
            <p className="text-muted-foreground">Cargando promociones...</p>
          ) : !storeId ? (
            <p className="text-muted-foreground">Necesitas una tienda activa para gestionar promociones.</p>
          ) : promotions.length === 0 ? (
            <p className="text-muted-foreground">
              No tienes promociones activas. Crea una nueva para captar mas clientes.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Validez</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {promotions.map((promotion) => (
                    <tr key={promotion.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">{promotion.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{promotion.type}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[promotion.status] ?? "outline"}>
                          {promotion.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {promotion.startsAt
                          ? dateFormatter.format(new Date(promotion.startsAt))
                          : "-"}
                        {promotion.endsAt && (
                          <>
                            <span className="px-1">→</span>
                            {dateFormatter.format(new Date(promotion.endsAt))}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/dashboard/seller/promotions/${promotion.id}/edit`}>Editar</Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(promotion.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <span>
              Pagina {pagination?.page ?? 1} de {pagination?.totalPages ?? 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination?.prev || promotionsQuery.isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination?.next || promotionsQuery.isFetching}
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


