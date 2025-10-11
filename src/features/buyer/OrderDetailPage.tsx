import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchOrderById } from "./api";

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

const dateTime = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
});

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

export function BuyerOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const orderQuery = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: Boolean(orderId),
  });

  const order = orderQuery.data?.data;
  console.log({ order });

  if (orderQuery.isLoading) {
    return <p>Cargando detalles de la orden...</p>;
  }

  if (orderQuery.isError) {
    return <p>Error al cargar los detalles de la orden.</p>;
  }

  if (!order) {
    return <p>Orden no encontrada.</p>;
  }

  const orderDate = dateTime.format(new Date(order.createdAt));
  const orderStatusMeta = statusMeta[order.status] ?? {
    label: order.status,
    variant: "outline" as const,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Seguimiento de la orden #{order.id.slice(0, 8)}
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulta el estado y los detalles de tu compra.
        </p>
      </div>

      {/* Order Status Stepper - Placeholder for now */}
      <Card className="p-6">
        <CardTitle className="mb-4 text-lg font-semibold">
          Estado del Pedido
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Ordenado</span>
          <span>En Proceso</span>
          <span>Enviado</span>
          <span>Entregado</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: "50%" /* This should be dynamic based on order status */,
            }}
          ></div>
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{orderDate}</span>
          <span>{orderStatusMeta.label}</span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Productos en la Orden
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex items-center py-4">
                <img
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  className="mr-4 h-16 w-16 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  {money.format(item.product.priceFinal * item.quantity)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Detalles de la Orden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Fecha de Orden:
              </span>
              <span className="text-sm">{orderDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Estado:
              </span>
              <Badge variant={orderStatusMeta.variant}>
                {orderStatusMeta.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Email:
              </span>
              <span className="text-sm flex items-center gap-1">
                {order.user.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Teléfono:
              </span>
              <span className="text-sm flex items-center gap-1">
                {order.user.firstName || "N/A"}
              </span>{" "}
              {/* Assuming phone is not directly in order.user, using firstName as placeholder */}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Método de Pago:
              </span>
              <span className="text-sm flex items-center gap-1">
                Tarjeta de Crédito
              </span>{" "}
              {/* Placeholder */}
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Dirección de Envío:
              </span>
              <span className="text-sm text-right flex items-center gap-1">
                62 Miles Drive St, Newark, NJ 07103, California
              </span>{" "}
              {/* Placeholder */}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-lg font-semibold">Precio Total:</span>
              <span className="text-lg font-semibold">
                {money.format(order.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancelar Orden</Button>
        <Button>Contactar Vendedor</Button>
      </div>
    </div>
  );
}
