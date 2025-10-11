import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserById } from "@/features/users/api";
import { deleteDiscount } from "../api";
import { useStoreDiscounts } from "../hooks";
import { useState } from "react";
import type { DiscountItem } from "../types";

const statusVariant: Record<string, "default" | "outline" | "secondary"> = {
  active: "default",
  inactive: "secondary",
  deleted: "outline",
};

export function SellerDiscountsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [page, setPage] = useState(1);

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id;
  const discountsQuery = useStoreDiscounts(storeId, { page, limit: 10 });

  const deleteMutation = useMutation({
    mutationFn: (discountId: string) => deleteDiscount(discountId),
    onSuccess: () => discountsQuery.refetch(),
  });

  const discounts: DiscountItem[] = discountsQuery.data?.data ?? [];
  const pagination = discountsQuery.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Descuentos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona descuentos personalizados para productos o periodos
            especiales.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/seller/discounts/new">Crear descuento</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Descuentos activos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {discountsQuery.isLoading ? (
            <p className="text-muted-foreground">Cargando descuentos...</p>
          ) : !storeId ? (
            <p className="text-muted-foreground">
              Necesitas una tienda activa para gestionar descuentos.
            </p>
          ) : discounts.length === 0 ? (
            <p className="text-muted-foreground">
              No tienes descuentos registrados actualmente.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {discounts.map((discount) => (
                    <tr key={discount.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {discount.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {discount.type}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {discount.type === "percentage"
                          ? `${discount.value}%`
                          : `RD$ ${discount.value}`}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={statusVariant[discount.status] ?? "outline"}
                        >
                          {discount.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link
                              to={`/dashboard/seller/discounts/${discount.id}/edit`}
                            >
                              Editar
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(discount.id)}
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
                disabled={!pagination?.prev || discountsQuery.isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination?.next || discountsQuery.isFetching}
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
