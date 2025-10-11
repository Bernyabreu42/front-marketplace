import { useMemo, useState, type ChangeEvent } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAdminOrders } from "@/features/admin/api";
import type { AdminOrder, AdminOrderStatus, AdminOrdersResponse } from "@/features/admin/types";

const statusLabel: Record<AdminOrderStatus, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  paid: "Pagada",
  shipped: "Enviada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusBadgeClass: Record<AdminOrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  shipped: "bg-indigo-100 text-indigo-700",
  completed: "bg-emerald-200 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-700",
};

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface FiltersState {
  status: "all" | AdminOrderStatus;
  store: string;
  from: string;
  to: string;
}

export function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    status: "all",
    store: "",
    from: "",
    to: "",
  });

  const queryKey = useMemo(
    () => ["admin", "orders", page, filters.status],
    [page, filters.status]
  );

  const ordersQuery = useQuery<AdminOrdersResponse>({
    queryKey,
    queryFn: () =>
      fetchAdminOrders({
        page,
        limit: 15,
        status: filters.status !== "all" ? filters.status : undefined,
      }),
  });

  const orders: AdminOrder[] = ordersQuery.data?.data ?? [];
  const pagination = ordersQuery.data?.pagination;
  const storeSearch = filters.store.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    const fromBoundary = filters.from ? new Date(filters.from) : undefined;
    const toBoundary = filters.to ? new Date(filters.to) : undefined;
    if (toBoundary) {
      toBoundary.setHours(23, 59, 59, 999);
    }

    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      if (fromBoundary && createdAt < fromBoundary) {
        return false;
      }
      if (toBoundary && createdAt > toBoundary) {
        return false;
      }
      if (storeSearch) {
        const storeName = order.store?.name?.toLowerCase() ?? "";
        const matchesName = storeName.includes(storeSearch);
        const matchesId = order.storeId.toLowerCase().includes(storeSearch);
        if (!matchesName && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [orders, storeSearch, filters.from, filters.to]);

  const handleFilterChange = (name: keyof FiltersState) =>
    (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      const value = event.target.value;
      setFilters((prev) => ({ ...prev, [name]: value as FiltersState[keyof FiltersState] }));
      setPage(1);
    };

  const hasFiltersApplied =
    filters.status !== "all" || filters.store.trim() || filters.from || filters.to;

  const clearFilters = () => {
    if (!hasFiltersApplied) return;
    setFilters({ status: "all", store: "", from: "", to: "" });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Monitorea el flujo de pedidos, identifica incidencias y accede al detalle para escalaciones.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {Object.entries(statusLabel).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${statusBadgeClass[status as AdminOrderStatus]}`}></span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Resumen de pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 md:grid-cols-[repeat(2,minmax(0,220px))] lg:grid-cols-[repeat(5,minmax(0,200px))]">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="order-status-filter">
                Estado
              </label>
              <select
                id="order-status-filter"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                value={filters.status}
                onChange={handleFilterChange("status")}
              >
                <option value="all">Todos</option>
                {Object.entries(statusLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="order-store-filter">
                Tienda (nombre)
              </label>
              <Input
                id="order-store-filter"
                value={filters.store}
                onChange={handleFilterChange("store")}
                placeholder="Ejemplo: Comercio Central"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="order-from-filter">
                Desde
              </label>
              <Input
                id="order-from-filter"
                type="date"
                value={filters.from}
                onChange={handleFilterChange("from")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="order-to-filter">
                Hasta
              </label>
              <Input
                id="order-to-filter"
                type="date"
                value={filters.to}
                onChange={handleFilterChange("to")}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={ordersQuery.isFetching || !hasFiltersApplied}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          {ordersQuery.isLoading ? (
            <p className="text-muted-foreground">Cargando pedidos...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-muted-foreground">No se encontraron pedidos con los filtros aplicados.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[65vh] overflow-auto">
                <table className="min-w-[980px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Orden</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Tienda</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Creada</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium text-foreground">{order.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {order.user?.email ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <Link
                            to={`/dashboard/admin/stores/${order.storeId}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            {order.store?.name ?? "Sin nombre"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{money.format(order.total)}</td>
                        <td className="px-4 py-3">
                          <Badge className={statusBadgeClass[order.status] ?? "bg-slate-200 text-slate-600"}>
                            {statusLabel[order.status] ?? order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/dashboard/admin/orders/${order.id}`}>Ver detalle</Link>
                          </Button>
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
              Página {pagination?.page ?? 1} de {pagination?.totalPages ?? 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination?.prev || ordersQuery.isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination?.next || ordersQuery.isFetching}
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
