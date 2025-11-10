import { useMemo, useState, type ChangeEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/AuthContext";
import { useStoreOrders } from "./hooks";
import type { OrderStatus, SellerOrder } from "./types";
import { Link } from "react-router-dom";

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  paid: "Pagada",
  shipped: "Enviada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusBadgeClass: Record<OrderStatus, string> = {
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

interface FiltersState {
  status: "all" | OrderStatus;
  query: string;
}

export function SellerOrdersPage() {
  const { user } = useAuth();
  const storeId = user?.store?.id;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    status: "all",
    query: "",
  });

  const ordersQuery = useStoreOrders(storeId, {
    page,
    limit: 15,
    status: filters.status !== "all" ? filters.status : undefined,
  });

  const orders: SellerOrder[] = ordersQuery.data?.data ?? [];
  const pagination = ordersQuery.data?.pagination;
  const search = filters.query.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    if (!search) {
      return orders;
    }
    return orders.filter((order) => {
      const email = order.user?.email?.toLowerCase();
      const fullName = `${order.user?.firstName ?? ""} ${
        order.user?.lastName ?? ""
      }`
        .trim()
        .toLowerCase();
      return (
        order.id.toLowerCase().includes(search) ||
        (email && email.includes(search)) ||
        (fullName && fullName.includes(search))
      );
    });
  }, [orders, search]);

  const handleFilterChange =
    (name: keyof FiltersState) =>
    (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      const value = event.target.value;
      setFilters((prev) => ({
        ...prev,
        [name]: value as FiltersState[keyof FiltersState],
      }));
      setPage(1);
    };

  const clearFilters = () => {
    if (filters.status === "all" && !search) return;
    setFilters({ status: "all", query: "" });
    setPage(1);
  };

  // console.log({ storeId, filters, orders });

  if (!storeId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Necesitas una tienda activa para gestionar pedidos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Supervisa los pedidos recibidos y manten informados a tus clientes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Pedidos de tu tienda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-[repeat(3,minmax(0,200px))] lg:grid-cols-[repeat(4,minmax(0,220px))]">
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="seller-order-status"
              >
                Estado
              </label>
              <select
                id="seller-order-status"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                value={filters.status}
                onChange={handleFilterChange("status")}
                disabled={ordersQuery.isLoading}
              >
                <option value="all">Todos</option>
                {Object.entries(statusLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2 lg:col-span-3">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="seller-order-query"
              >
                Buscar (ID, email o nombre)
              </label>
              <Input
                id="seller-order-query"
                value={filters.query}
                onChange={handleFilterChange("query")}
                placeholder="Ejemplo: cliente@correo.com"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={
                  ordersQuery.isFetching ||
                  (filters.status === "all" && !search)
                }
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          {ordersQuery.isLoading ? (
            <p className="text-muted-foreground">Cargando pedidos...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-muted-foreground">
              No se encontraron pedidos con los filtros aplicados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[65vh] overflow-auto">
                <table className="min-w-[860px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Subtotal</th>
                      <th className="px-4 py-3">Descuentos</th>
                      <th className="px-4 py-3">Impuestos</th>
                      <th className="px-4 py-3">Envio</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 text-muted-foreground flex flex-col gap-1">
                          <span>{order.user?.firstName ?? "-"}</span>
                          <span className="text-xs">
                            {order.user?.email ?? "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              statusBadgeClass[order.status] ??
                              "bg-slate-200 text-slate-600"
                            }
                          >
                            {statusLabel[order.status] ?? order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {money.format(order.subtotal)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {money.format(order.totalDiscountAmount)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {money.format(order.taxAmount)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {money.format(order.shippingAmount)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {money.format(order.total)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/dashboard/seller/orders/${order.id}`}>
                              Gestionar
                            </Link>
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
