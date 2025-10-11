import { useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchStoreDiscounts,
  fetchStorePromotions,
} from "@/features/seller/api";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/utils";
import {
  deleteAdminStore,
  fetchAdminProducts,
  fetchAdminStore,
  updateStoreStatus,
} from "./api";
import type { AdminProductsResponse, AdminStoreDetail } from "./types";
import type { DiscountItem, PromotionItem } from "@/features/seller/types";

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  active: "Activa",
  inactive: "Inactiva",
  banned: "Suspendida",
};

const statusBadgeClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-200 text-slate-700",
  banned: "bg-rose-100 text-rose-700",
  deleted: "bg-slate-300 text-slate-600",
};

const statusOptions = Object.keys(statusLabel) as Array<
  keyof typeof statusLabel
>;

const promotionTypeLabel: Record<string, string> = {
  automatic: "Automatica",
  coupon: "Cupon",
};

const discountTypeLabel: Record<string, string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
};

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    console.log(error);
    return value;
  }
};

export function AdminStoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [productPage, setProductPage] = useState(1);

  const storeQuery = useQuery({
    queryKey: ["admin", "stores", storeId],
    queryFn: () => fetchAdminStore(storeId!),
    enabled: Boolean(storeId),
  });

  const productsQuery = useQuery<AdminProductsResponse>({
    queryKey: ['admin', 'stores', storeId, 'products', productPage],
    queryFn: () => fetchAdminProducts({ storeId, page: productPage, limit: 15 }),
    enabled: Boolean(storeId),
  });

  const promotionsQuery = useQuery({
    queryKey: ['admin', 'stores', storeId, 'promotions'],
    queryFn: () => fetchStorePromotions(storeId!, { page: 1, limit: 20 }),
    enabled: Boolean(storeId),
  });

  const discountsQuery = useQuery({
    queryKey: ['admin', 'stores', storeId, 'discounts'],
    queryFn: () => fetchStoreDiscounts(storeId!, { page: 1, limit: 20 }),
    enabled: Boolean(storeId),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateStoreStatus(storeId!, status),
    onSuccess: (_, newStatus) => {
      toast.success(
        `Estado actualizado a ${statusLabel[newStatus] ?? newStatus}`
      );
      storeQuery.refetch();
      productsQuery.refetch();
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminStore(storeId!),
    onSuccess: () => {
      toast.success("La tienda fue eliminada");
      navigate("/dashboard/admin/stores", { replace: true });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const store = storeQuery.data?.data as AdminStoreDetail | undefined;
  const products = productsQuery.data?.data ?? [];
  const productPagination = productsQuery.data?.pagination;
  const promotions = (promotionsQuery.data?.data as PromotionItem[] | undefined) ?? [];
  const discounts = (discountsQuery.data?.data as DiscountItem[] | undefined) ?? [];

  const stats = useMemo(
    () => ({
      products: store?._count?.products ?? 0,
      reviews: store?._count?.reviews ?? 0,
      activeProducts: store?.activeProducts ?? store?._count?.products ?? 0,
      rating: store?.averageRating ?? null,
    }),
    [store]
  );

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value;
    if (!store || !isAdmin) return;

    statusMutation.mutate(nextStatus);
  };

  const handleDelete = () => {
    if (!isAdmin) return;
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar la tienda? Esta accion no se puede deshacer."
    );
    if (confirmDelete) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-fit px-0 text-sm"
            onClick={() => navigate(-1)}
          >
            ← Volver
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {store?.name ?? "Tienda"}
            </h1>
            {store?.status && (
              <Badge
                className={
                  statusBadgeClass[store.status] ??
                  "bg-slate-200 text-slate-600"
                }
              >
                {statusLabel[store.status] ?? store.status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Creada el: {formatDate(store?.createdAt ?? null)}
          </p>
        </div>
        {isAdmin && store && (
          <div className="flex flex-wrap gap-2">
            {store.status === "active" || store.status === "inactive" ? (
              <Button
                variant="outline"
                disabled={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate(
                    store.status === "active" ? "inactive" : "active"
                  )
                }
              >
                {statusMutation.isPending
                  ? "Actualizando..."
                  : store.status === "active"
                  ? "Pausar"
                  : "Reactivar"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate("active")}
                >
                  Marcar activa
                </Button>
                <Button
                  variant="outline"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate("inactive")}
                >
                  Pausar
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Informacion de la tienda
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {storeQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">
                Cargando informacion...
              </p>
            ) : !store ? (
              <p className="text-sm text-muted-foreground">
                No pudimos cargar la tienda solicitada.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Propietario
                  </p>
                  <p className="text-sm text-foreground">
                    {store.owner?.displayName ?? store.owner?.email ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Correo
                  </p>
                  <p className="text-sm text-foreground">
                    {store.email ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Telefono
                  </p>
                  <p className="text-sm text-foreground">
                    {store.phone ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Direccion
                  </p>
                  <p className="text-sm text-foreground">
                    {store.address ?? "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase text-muted-foreground">
                    Descripcion
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {store.description || "Sin descripcion proporcionada."}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Administracion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Estado de la tienda</p>
              <p className="text-muted-foreground">
                Cambia el estado de publicacion segun las politicas del
                marketplace.
              </p>
            </div>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={store?.status ?? "pending"}
              onChange={handleStatusChange}
              disabled={!isAdmin || statusMutation.isPending || !store}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {statusLabel[option]}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={!isAdmin || deleteMutation.isPending}
            >
              Eliminar tienda
            </Button>
            <p className="text-xs text-muted-foreground">
              Solo los administradores pueden cambiar el estado o eliminar una
              tienda.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Estadisticas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Productos</p>
            <p className="text-2xl font-semibold text-foreground">
              {stats.products}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Productos activos
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {stats.activeProducts}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Resenas</p>
            <p className="text-2xl font-semibold text-foreground">
              {stats.reviews}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Rating promedio
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {stats.rating ? stats.rating.toFixed(1) : "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Promociones de la tienda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {promotionsQuery.isLoading ? (
            <p className="text-muted-foreground">Cargando promociones...</p>
          ) : promotions.length === 0 ? (
            <p className="text-muted-foreground">
              Esta tienda no tiene promociones registradas.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[40vh] overflow-auto">
                <table className="min-w-[640px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Codigo / Valor</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Vigencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {promotions.map((promotion) => (
                      <tr
                        key={promotion.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {promotion.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {promotionTypeLabel[promotion.type] ?? promotion.type}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {promotion.type === "coupon"
                            ? promotion.code || "-"
                            : promotion.value !== null &&
                              promotion.value !== undefined
                            ? `${promotion.value}%`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {promotion.status}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {promotion.startsAt || promotion.endsAt
                            ? `${formatDate(promotion.startsAt)} - ${formatDate(
                                promotion.endsAt
                              )}`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Descuentos disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {discountsQuery.isLoading ? (
            <p className="text-muted-foreground">Cargando descuentos...</p>
          ) : discounts.length === 0 ? (
            <p className="text-muted-foreground">
              Esta tienda no tiene descuentos configurados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[40vh] overflow-auto">
                <table className="min-w-[600px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Creado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {discounts.map((discount) => (
                      <tr
                        key={discount.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {discount.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {discountTypeLabel[discount.type] ?? discount.type}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {discount.type === "percentage"
                            ? `${discount.value}%`
                            : money.format(discount.value)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {discount.status}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatDate(discount.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Productos publicados
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Catalogo disponible en esta tienda.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/admin/products">Ver catalogo global</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {productsQuery.isLoading ? (
            <p className="text-muted-foreground">Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground">
              Esta tienda aun no tiene productos publicados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-[720px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {money.format(product.priceFinal)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {product.stock}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {product.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Pagina {productPagination?.page ?? 1} de{" "}
              {productPagination?.totalPages ?? 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductPage((prev) => Math.max(1, prev - 1))}
                disabled={!productPagination?.prev || productsQuery.isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductPage((prev) => prev + 1)}
                disabled={!productPagination?.next || productsQuery.isFetching}
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





