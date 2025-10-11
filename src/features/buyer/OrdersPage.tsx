import type { OrderSummary } from "./types";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyOrders } from "./hooks";
import { Link } from "react-router-dom";

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

const dateTime = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
});

const STATUSES = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "En proceso" },
  { value: "paid", label: "Pagada" },
  { value: "shipped", label: "Enviada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

const statusMeta: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pendiente", variant: "secondary" },
  processing: { label: "En proceso", variant: "secondary" },
  paid: { label: "Pagada", variant: "default" },
  shipped: { label: "Enviada", variant: "default" },
  completed: { label: "Completada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

export function BuyerOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const queryParams = useMemo(
    () => ({ page, limit: 10, status: status || undefined }),
    [page, status]
  );
  const { data, isLoading, isFetching } = useMyOrders(queryParams);

  const orders: OrderSummary[] = data?.data ?? [];
  const pagination = data?.pagination;

  const canPrev = Boolean(pagination?.prev) && !isFetching;
  const canNext = Boolean(pagination?.next) && !isFetching;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis ordenes</h1>
          <p className="text-sm text-muted-foreground">
            Consulta el historial de compras y el estado de cada orden.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            Estado
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              {STATUSES.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Historial de ordenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando ordenes...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No encontramos ordenes con los criterios seleccionados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Codigo</th>
                    <th className="px-4 py-3">Realizada</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Productos</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {orders.map((order) => {
                    const meta = statusMeta[order.status] ?? {
                      label: order.status,
                      variant: "outline" as const,
                    };
                    const formattedDate = dateTime.format(
                      new Date(order.createdAt)
                    );
                    const itemsLabel = order.items
                      .map((item) => `${item.quantity}x ${item.product?.name}`)
                      .filter(Boolean)
                      .join(", ");
                    return (
                      <tr key={order.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium text-foreground">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formattedDate}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {money.format(order.total)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {itemsLabel || "Sin detalles"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/dashboard/buyer/orders/${order.id}`}>
                              Ver Detalles
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              Pagina {pagination?.page ?? 1} de {pagination?.totalPages ?? 1}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!canPrev}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!canNext}
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
