import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDiscount } from "@/features/seller/api";
import type { DiscountItem } from "@/features/seller/types";
import { getApiErrorMessage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
});

const typeLabel: Record<string, string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
};

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function AdminDiscountDetailPage() {
  const { discountId } = useParams<{ discountId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeId = user?.store?.id;

  const { data, isLoading, error } = useQuery<{ data: DiscountItem }>({
    queryKey: ["admin", "discounts", discountId],
    queryFn: () => fetchDiscount(discountId!),
    enabled: Boolean(discountId),
  });

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error));
      navigate("/dashboard/admin/discounts", { replace: true });
    }
  }, [error, navigate]);

  const discount = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Detalle de descuento</h1>
          <p className="text-sm text-muted-foreground">
            Consulta la configuracion y el estado actual del descuento seleccionado.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {isLoading ? (
            <>
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6 md:col-span-2" />
            </>
          ) : !discount ? (
            <p className="text-sm text-muted-foreground">No pudimos encontrar el descuento solicitado.</p>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Nombre</p>
                <p className="text-sm text-foreground">{discount.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Tipo</p>
                <p className="text-sm text-foreground">
                  {typeLabel[discount.type] ?? discount.type}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Valor</p>
                <p className="text-sm text-foreground">
                  {discount.type === "percentage" ? `${discount.value}%` : money.format(discount.value)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Estado</p>
                <p className="text-sm text-foreground capitalize">{discount.status}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Creado</p>
                <p className="text-sm text-foreground">{dateFormatter.format(new Date(discount.createdAt))}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Actualizado</p>
                <p className="text-sm text-foreground">{dateFormatter.format(new Date(discount.updatedAt))}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
