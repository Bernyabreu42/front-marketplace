import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchUserById } from "@/features/users/api";
import { useSellerStore, useStoreDiscounts, useStoreProducts, useStorePromotions, useStoreTaxes } from "./hooks";
import { formatStoreAddress } from "./utils/address";

const STORE_STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  active: { label: "Activa", variant: "default" },
  inactive: { label: "Inactiva", variant: "outline" },
  banned: { label: "Suspendida", variant: "destructive" },
  deleted: { label: "Eliminada", variant: "destructive" },
};

const metricsFormatter = new Intl.NumberFormat("es-DO");

export function SellerOverviewPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  const storeId = userProfileQuery.data?.data.store?.id ?? undefined;

  const storeQuery = useSellerStore(storeId);
  const productsQuery = useStoreProducts(storeId, { page: 1, limit: 5 });
  const promotionsQuery = useStorePromotions(storeId, { page: 1, limit: 1 });
  const discountsQuery = useStoreDiscounts(storeId, { page: 1, limit: 1 });
  const taxesQuery = useStoreTaxes(storeId, { page: 1, limit: 1 });

  const store = storeQuery.data?.data;
  const totalProducts = store?._count?.products ?? productsQuery.data?.pagination.total ?? 0;
  const totalPromotions = promotionsQuery.data?.pagination.total ?? 0;
  const totalDiscounts = discountsQuery.data?.pagination.total ?? 0;
  const totalTaxes = taxesQuery.data?.pagination.total ?? 0;

  const statusMeta = useMemo(() => {
    if (!store?.status) {
      return { label: "Sin estado", variant: "outline" as const };
    }
    return STORE_STATUS_META[store.status] ?? {
      label: store.status,
      variant: "outline" as const,
    };
  }, [store?.status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Panel del vendedor</h1>
        <p className="text-sm text-muted-foreground">
          Administra tu tienda, promociones y catalogo de productos desde un mismo lugar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estado de la tienda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            <p className="text-xs text-muted-foreground">
              {store?.status === "pending"
                ? "Estamos revisando tu solicitud. Te avisaremos cuando la tienda este publicada."
                : "Puedes actualizar los datos de tu tienda desde la seccion correspondiente."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Productos publicados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {storeQuery.isLoading ? "-" : metricsFormatter.format(totalProducts)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Promociones activas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {promotionsQuery.isLoading ? "-" : metricsFormatter.format(totalPromotions)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Descuentos e impuestos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-xl font-semibold text-foreground">
              {discountsQuery.isLoading ? "-" : metricsFormatter.format(totalDiscounts)} descuentos
            </p>
            <p className="text-sm text-muted-foreground">
              {taxesQuery.isLoading ? "-" : `${metricsFormatter.format(totalTaxes)} impuestos configurados`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Datos de tu tienda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {storeQuery.isLoading && <p className="text-muted-foreground">Cargando informacion...</p>}
            {!storeQuery.isLoading && store && (
              <>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Nombre comercial</p>
                  <p className="font-medium text-foreground">{store.name}</p>
                </div>
                {store.tagline && (
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Eslogan</p>
                    <p className="text-foreground">{store.tagline}</p>
                  </div>
                )}
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Correo</p>
                    <p className="text-foreground">{store.email ?? "No definido"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Telefono</p>
                    <p className="text-foreground">{store.phone ?? "No definido"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Direccion</p>
                    <p className="text-foreground">
                      {formatStoreAddress(store.address ?? null) || "No definida"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Sitio web</p>
                    <p className="text-foreground">{store.website ?? "No definido"}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Productos recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {productsQuery.isLoading && <p className="text-muted-foreground">Cargando productos...</p>}
            {!productsQuery.isLoading && (productsQuery.data?.data.length ?? 0) === 0 && (
              <p className="text-muted-foreground">
                Todavia no has publicado productos. Crea tu primer articulo desde la seccion de productos.
              </p>
            )}
            {!productsQuery.isLoading && (productsQuery.data?.data.length ?? 0) > 0 && (
              <div className="space-y-2">
                {productsQuery.data?.data.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{product.name}</span>
                      <span className="text-muted-foreground">
                        {metricsFormatter.format(product.stock)} uds.
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground">
                      Precio: RD$ {metricsFormatter.format(product.priceFinal)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
