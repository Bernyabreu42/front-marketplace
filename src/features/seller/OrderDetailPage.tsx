import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/auth/AuthContext";
import { fetchStoreOrder, updateStoreOrderStatus } from "@/features/seller/api";
import type {
  OrderStatus,
  SellerOrder,
  SellerOrderResponse,
} from "@/features/seller/types";
import { getApiErrorMessage } from "@/lib/utils";

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  paid: "Pagada",
  shipped: "Enviada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusOptions: OrderStatus[] = [
  "pending",
  "processing",
  "paid",
  "shipped",
  "completed",
  "cancelled",
];

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

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function SellerOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const orderQuery = useQuery<SellerOrderResponse>({
    queryKey: ["seller", "order", orderId],
    queryFn: () => fetchStoreOrder(orderId!),
    enabled: Boolean(orderId),
  });

  useEffect(() => {
    if (orderQuery.error) {
      toast.error(getApiErrorMessage(orderQuery.error));
      navigate("/dashboard/seller/orders", { replace: true });
    }
  }, [orderQuery.error, navigate]);

  const order: SellerOrder | undefined = orderQuery.data?.data;

  useEffect(() => {
    if (order && user?.store?.id && order.storeId !== user.store.id) {
      toast.error("No tienes acceso a esta orden");
      navigate("/dashboard/seller/orders", { replace: true });
    }
  }, [order, user?.store?.id, navigate]);

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) =>
      updateStoreOrderStatus(orderId!, status),
    onSuccess: (response) => {
      toast.success("Estado actualizado correctamente");
      queryClient.setQueryData(["seller", "order", orderId], response);
      queryClient.invalidateQueries({
        queryKey: ["seller", "orders"],
        exact: false,
      });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Gestión de pedido
          </h1>
          <p className="text-sm text-muted-foreground">
            Revisa el detalle del pedido y mantén actualizado el estado para el
            cliente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/dashboard/seller/orders">Regresar</Link>
          </Button>
          {order && (
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
              value={order.status}
              onChange={(event) =>
                mutation.mutate(event.target.value as OrderStatus)
              }
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
            <CardTitle className="text-base font-semibold">Resumen</CardTitle>
            {order && (
              <p className="text-xs text-muted-foreground">
                Creada el {formatDateTime(order.createdAt)} · Última
                actualización {formatDateTime(order.updatedAt)}
              </p>
            )}
          </div>
          {order && (
            <Badge
              className={
                statusBadgeClass[order.status] ?? "bg-slate-200 text-slate-600"
              }
            >
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
                <p className="text-xs uppercase text-muted-foreground">
                  ID de la orden
                </p>
                <p className="text-sm font-medium text-foreground">
                  {order.id}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Cliente
                </p>
                <p className="text-sm text-foreground">
                  {order.user?.email ?? "No disponible"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Subtotal
                </p>
                <p className="text-sm text-foreground">
                  {money.format(order.subtotal)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Total</p>
                <p className="text-sm font-medium text-foreground">
                  {money.format(order.total)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Impuestos
                </p>
                <p className="text-sm text-foreground">
                  {money.format(order.taxAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Envío</p>
                <p className="text-sm text-foreground">
                  {money.format(order.shippingAmount)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Dirección y envío
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {orderQuery.isLoading || !order ? (
            <Skeleton className="h-24" />
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Método de envío
                  </p>
                  <Input
                    value={order.shippingMethod ?? "No especificado"}
                    readOnly
                  />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Tracking
                  </p>
                  <Input
                    value={order.trackingNumber ?? "Sin asignar"}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Dirección
                </p>
                <Textarea
                  value={
                    order.shippingAddress
                      ? JSON.stringify(order.shippingAddress, null, 2)
                      : "Sin dirección registrada"
                  }
                  readOnly
                  className="h-40"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-semibold">
            Resumen de descuentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {orderQuery.isLoading || !order ? (
            <Skeleton className="h-24" />
          ) : (
            <div className="flex flex-col gap-2">
              {order.priceAdjustments.map(({ name, amount }) => (
                <span>
                  {name} {money.format(amount)}
                </span>
              ))}
            </div>
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
            <p className="text-muted-foreground">
              No se registraron productos en este pedido.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Cantidad</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Descuentos</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card/90">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-foreground">
                        {item.product?.name ?? item.productId}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.product ? money.format(item.product.price) : "-"}
                      </td>
                      <td className="px-4 py-3 text-green-500">
                        {item.product ? money.format(item.lineDiscount) : "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.product
                          ? money.format(
                              item.product.priceFinal * item.quantity
                            )
                          : "-"}
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
