import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStorePromotions } from "@/features/seller/api";
import type { PromotionItem, PromotionsResponse } from "@/features/seller/types";

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
});

const promotionTypeLabel: Record<string, string> = {
  automatic: "Automatica",
  coupon: "Cupon",
};

const statusVariant: Record<string, string> = {
  active: "default",
  scheduled: "secondary",
  ended: "outline",
};

export function AdminPromotionsPage() {
  const { user } = useAuth();
  const storeId = user?.store?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery<PromotionsResponse>({
    queryKey: ["admin", "promotions", storeId, page],
    queryFn: () => fetchStorePromotions(storeId!, { page, limit: 20 }),
    enabled: Boolean(storeId),
  });

  const promotions: PromotionItem[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Promociones</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza las promociones configuradas por los vendedores y revisa su estado.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/seller/promotions/new">Crear promocion</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Listado global de promociones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Cargando promociones...</p>
          ) : promotions.length === 0 ? (
            <p className="text-muted-foreground">No se encontraron promociones registradas.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-[720px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Vigencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {promotions.map((promotion) => (
                      <tr key={promotion.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium text-foreground">{promotion.name}</td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {promotionTypeLabel[promotion.type] ?? promotion.type}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {promotion.type === "coupon"
                            ? promotion.code || "-"
                            : promotion.value !== null && promotion.value !== undefined
                              ? `${promotion.value}%`
                              : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={(statusVariant[promotion.status] as any) ?? "outline"}>
                            {promotion.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {promotion.startsAt
                            ? dateFormatter.format(new Date(promotion.startsAt))
                            : "-"}
                          {promotion.endsAt && (
                            <>
                              <span className="px-1">-</span>
                              {dateFormatter.format(new Date(promotion.endsAt))}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                disabled={!pagination?.prev || isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination?.next || isFetching}
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
