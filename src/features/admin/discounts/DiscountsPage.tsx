import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStoreDiscounts } from "@/features/seller/api";
import type { DiscountItem, DiscountsResponse } from "@/features/seller/types";

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
});

const discountTypeLabel: Record<string, string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
};

export function AdminDiscountsPage() {
  const { user } = useAuth();
  const storeId = user?.store?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery<DiscountsResponse>({
    queryKey: ["admin", "discounts", storeId, page],
    queryFn: () => fetchStoreDiscounts(storeId!, { page, limit: 20 }),
    enabled: Boolean(storeId),
  });

  const discounts: DiscountItem[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Descuentos</h1>
          <p className="text-sm text-muted-foreground">
            Consulta los descuentos activos y planificados en las tiendas del marketplace.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/seller/discounts/new">Crear descuento</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Listado global de descuentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Cargando descuentos...</p>
          ) : discounts.length === 0 ? (
            <p className="text-muted-foreground">No se encontraron descuentos registrados.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-[680px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Creado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {discounts.map((discount) => (
                      <tr key={discount.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium text-foreground">{discount.name}</td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {discountTypeLabel[discount.type] ?? discount.type}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {discount.type === "percentage" ? `${discount.value}%` : discount.value}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">{discount.status}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {dateFormatter.format(new Date(discount.createdAt))}
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
