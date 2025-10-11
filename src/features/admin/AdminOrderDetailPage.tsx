import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/utils";
import { fetchAdminOrder, updateAdminOrderStatus } from "@/features/admin/api";
import type { AdminOrder, AdminOrderResponse, AdminOrderStatus } from "@/features/admin/types";

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

const statusOptions: AdminOrderStatus[] = [
  "pending",
  "processing",
  "paid",
  "shipped",
  "completed",
  "cancelled",
];

export function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["admin", "order", orderId], [orderId]);

  const orderQuery = useQuery<AdminOrderResponse>({
    queryKey,
    queryFn: () => fetchAdminOrder(orderId!),
    enabled: Boolean(orderId),
  });

  useEffect(() => {
    if (orderQuery.error) {
      toast.error(getApiErrorMessage(orderQuery.error));
      navigate("/dashboard/admin/orders", { replace: true });
    }
  }, [orderQuery.error, navigate]);

  const order: AdminOrder | undefined = orderQuery.data?.data;

  const mutation = useMutation({
    mutationFn: (status: AdminOrderStatus) => updateAdminOrderStatus(orderId!, status),
    onSuccess: (response) => {
      toast.success("Estado de la orden actualizado");
      queryClient.setQueryData(queryKey, response);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"], exact: false });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Detalle de pedido</h1>
          <p className="text-sm text-muted-foreground">
            Revisa el historial y administra el estado de la orden seleccionada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/dashboard/admin/orders">Regresar</Link>
          </Button>
          {order && (
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
              value={order.status}
              onChange={(event) => mutation.mutate(event.target.value as AdminOrderStatus)}
              disabled={mutation.isPending}
            >
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {statusLabel[value]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Información general</CardTitle>
            {order && (
              <p className="text-xs text-muted-foreground">
                Creada el {formatDate(order.createdAt)} · Última actualización {formatDate(order.updatedAt)}
              </p>
            )}
          </div>
          {order && (
            <Badge className={statusBadgeClass[order.status] ?? "bg-slate-200 text-slate-600"}>
              {statusLabel[order.status] ?? order.status}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {orderQuery.isLoading || !order ? (
            <>
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
            </>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase text-muted-foreground">ID de la orden</p>
                <p className="text-sm font-medium text-foreground">{order.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Cliente</p>
                <p className="text-sm text-foreground">
                  {order.user ? `${order.user.email}` : "Usuario no disponible"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Tienda</p>
                <Link
                  to={`/dashboard/admin/stores/${order.storeId}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {order.store?.name ?? order.storeId}
                </Link>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Total</p>
                <p className="text-sm font-medium text-foreground">{money.format(order.total)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Subtotal</p>
                <p className="text-sm text-foreground">{money.format(order.subtotal)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Impuestos</p>
                <p className="text-sm text-foreground">{money.format(order.taxAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Envío</p>
                <p className="text-sm text-foreground">{money.format(order.shippingAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Promoción aplicada</p>
                <p className="text-sm text-foreground">
                  {order.promotionId ? `${order.promotionId} (${money.format(order.promotionAmount)})` : "Sin promoción"}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Dirección y envío</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {orderQuery.isLoading || !order ? (
            <Skeleton className="h-20" />
          ) : (
            <>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Método de envío</p>
                <p className="text-sm text-foreground">{order.shippingMethod ?? "No especificado"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Dirección</p>
                <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground">
                  {order.shippingAddress ? JSON.stringify(order.shippingAddress, null, 2) : "Sin dirección registrada"}
                </pre>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Tracking</p>
                  <p className="text-sm text-foreground">{order.trackingNumber}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {orderQuery.isLoading || !order ? (
            <Skeleton className="h-24" />
          ) : order.items.length === 0 ? (
            <p className="text-muted-foreground">No se registraron productos en esta orden.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Cantidad</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card/90">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-foreground">
                        {item.product?.name ?? item.productId}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.product ? money.format(item.product.priceFinal) : "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.product ? money.format(item.product.priceFinal * item.quantity) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
