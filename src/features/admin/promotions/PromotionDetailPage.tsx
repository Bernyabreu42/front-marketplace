import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPromotion } from "@/features/seller/api";
import type { PromotionItem } from "@/features/seller/types";
import { getApiErrorMessage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
});

const typeLabel: Record<string, string> = {
  automatic: "Automatica",
  coupon: "Cupon",
};

export function AdminPromotionDetailPage() {
  const { promotionId } = useParams<{ promotionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeId = user?.store?.id;

  const { data, isLoading, error } = useQuery<{ data: PromotionItem }>({
    queryKey: ["admin", "promotions", promotionId],
    queryFn: () => fetchPromotion(promotionId!),
    enabled: Boolean(promotionId),
  });

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error));
      navigate("/dashboard/admin/promotions", { replace: true });
    }
  }, [error, navigate]);

  const promotion = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Detalle de promocion</h1>
          <p className="text-sm text-muted-foreground">
            Revisa la configuracion y el estado actual de la promocion seleccionada.
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
          ) : !promotion ? (
            <p className="text-sm text-muted-foreground">No pudimos encontrar la promocion solicitada.</p>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Nombre</p>
                <p className="text-sm text-foreground">{promotion.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Tipo</p>
                <p className="text-sm text-foreground">
                  {typeLabel[promotion.type] ?? promotion.type}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Valor</p>
                <p className="text-sm text-foreground">
                  {promotion.type === "coupon"
                    ? promotion.code || "-"
                    : promotion.value !== null && promotion.value !== undefined
                      ? `${promotion.value}%`
                      : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Estado</p>
                <p className="text-sm text-foreground capitalize">{promotion.status}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Fecha de inicio</p>
                <p className="text-sm text-foreground">
                  {promotion.startsAt ? dateFormatter.format(new Date(promotion.startsAt)) : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Fecha de finalizacion</p>
                <p className="text-sm text-foreground">
                  {promotion.endsAt ? dateFormatter.format(new Date(promotion.endsAt)) : "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase text-muted-foreground">Descripcion</p>
                <p className="text-sm text-muted-foreground">
                  {promotion.description || "Sin descripcion proporcionada."}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
