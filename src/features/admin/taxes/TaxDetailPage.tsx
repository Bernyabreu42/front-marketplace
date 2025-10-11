import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAdminStore } from "@/features/admin/api";
import type { AdminStoreDetail } from "@/features/admin/types";
import { fetchTax } from "@/features/seller/api";
import type { TaxItem } from "@/features/seller/types";
import { getApiErrorMessage } from "@/lib/utils";

const typeLabel: Record<TaxItem["type"], string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
};

const statusLabel: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  deleted: "Eliminado",
};

const statusBadgeClass: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-amber-100 text-amber-700",
  deleted: "bg-slate-200 text-slate-600",
};

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

const formatRate = (tax: TaxItem) =>
  tax.type === "percentage" ? `${tax.rate}%` : money.format(tax.rate);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function AdminTaxDetailPage() {
  const { taxId } = useParams<{ taxId: string }>();
  const navigate = useNavigate();

  const taxQuery = useQuery<{ data: TaxItem }>({
    queryKey: ["admin", "tax", taxId],
    queryFn: () => fetchTax(taxId!),
    enabled: Boolean(taxId),
  });

  useEffect(() => {
    if (taxQuery.error) {
      toast.error(getApiErrorMessage(taxQuery.error));
      navigate("/dashboard/admin/taxes", { replace: true });
    }
  }, [taxQuery.error, navigate]);

  const tax = taxQuery.data?.data;

  const storeQuery = useQuery<{ data: AdminStoreDetail }>({
    queryKey: ["admin", "store", tax?.storeId],
    queryFn: () => fetchAdminStore(tax!.storeId),
    enabled: Boolean(tax?.storeId),
    staleTime: 60_000,
  });

  const store = storeQuery.data?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Detalle de impuesto
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulta la configuración completa y el historial básico del
            impuesto seleccionado.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/dashboard/admin/taxes">Regresar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Datos generales
            </CardTitle>
            {tax && (
              <p className="text-xs text-muted-foreground">
                Registrado el {formatDate(tax.createdAt)}
              </p>
            )}
          </div>
          {tax && (
            <Badge
              className={
                statusBadgeClass[tax.status] ?? "bg-slate-200 text-slate-600"
              }
            >
              {statusLabel[tax.status] ?? tax.status}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {taxQuery.isLoading ? (
            <>
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
            </>
          ) : !tax ? (
            <p className="text-sm text-muted-foreground">
              No pudimos encontrar el impuesto solicitado.
            </p>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Nombre
                </p>
                <p className="text-sm text-foreground">{tax.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Tipo</p>
                <p className="text-sm text-foreground">
                  {typeLabel[tax.type] ?? tax.type}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Valor</p>
                <p className="text-sm text-foreground">{formatRate(tax)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Descripción
                </p>
                <p className="text-sm text-foreground">
                  {tax.description ? tax.description : "Sin descripción"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase text-muted-foreground">
                  Tienda
                </p>
                {storeQuery.isLoading ? (
                  <Skeleton className="mt-1 h-6 w-48" />
                ) : store ? (
                  <div className="space-y-1">
                    <Link
                      to={`/dashboard/admin/stores/${store.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {store.name}
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-foreground">{tax.storeId}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Última actualización
                </p>
                <p className="text-sm text-foreground">
                  {formatDate(tax.updatedAt)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
