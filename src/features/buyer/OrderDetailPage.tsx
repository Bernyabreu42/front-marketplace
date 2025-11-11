import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchOrderById } from "./api";
import { useImageUrlResolver } from "@/hooks/use-image-url";
import type { OrderStatus } from "@/features/seller/types";

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
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pendiente", variant: "secondary" },
  processing: { label: "En proceso", variant: "secondary" },
  shipped: { label: "Enviada", variant: "default" },
  completed: { label: "Completada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

const FLOW_STATUSES = ["pending", "processing", "shipped", "completed"] as const;
type FlowStatus = (typeof FLOW_STATUSES)[number];

export function BuyerOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const resolveImageUrl = useImageUrlResolver();

  const orderQuery = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: Boolean(orderId),
  });

  const order = orderQuery.data?.data;

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
  const isKnownStatus = ORDER_STATUSES.includes(order.status as OrderStatus);
  const normalizedStatus = isKnownStatus
    ? (order.status as OrderStatus)
    : "pending";
  const isCancelled = normalizedStatus === "cancelled";
  const flowStatus: FlowStatus =
    FLOW_STATUSES.includes(normalizedStatus as FlowStatus)
      ? (normalizedStatus as FlowStatus)
      : "pending";
  const progressIndex = FLOW_STATUSES.indexOf(flowStatus);
  const progressPercent =
    progressIndex <= 0
      ? 0
      : (progressIndex / (FLOW_STATUSES.length - 1)) * 100;
  const orderStatusMeta = isKnownStatus
    ? statusMeta[normalizedStatus]
    : {
        label: order.status,
        variant: "outline" as const,
      };
  const statusSteps: Array<{ key: FlowStatus; label: string }> = [
    { key: "pending", label: "Ordenado" },
    { key: "processing", label: "En proceso" },
    { key: "shipped", label: "Enviado" },
    { key: "completed", label: "Entregado" },
  ];

  const getItemImage = (images?: string[]) => {
    const first = images?.find(Boolean) ?? "";
    const resolved = resolveImageUrl(first);
    return resolved || "/placeholder.svg";
  };

  const resolveUnitPrice = (item: (typeof order.items)[number]) => {
    if (typeof item.unitPriceFinal === "number") return item.unitPriceFinal ;
    if (typeof item.unitPrice === "number") return item.unitPrice;
    return item.product?.priceFinal ?? item.product?.price ?? 0;
  };

  const shippingAddress = (order.shippingAddress ?? {}) as Record<string, string | undefined>;
  const formattedAddress = (() => {
    if (!order.shippingAddress) return "No disponible";
    const parts = [
      shippingAddress.street,
      shippingAddress.apartment,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.postalCode,
      shippingAddress.country,
    ]
      .filter(Boolean)
      .join(", ");
    const reference = shippingAddress.reference ?? shippingAddress.note;
    return [parts, reference].filter(Boolean).join(" · ");
  })();

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

      {isCancelled ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-semibold">Esta orden fue cancelada</p>
          <p className="text-xs text-destructive/80">
            Si necesitas soporte adicional ponte en contacto con nosotros.
          </p>
        </div>
      ) : (
        <Card className="p-6">
          <CardTitle className="mb-4 text-lg font-semibold">
            Estado del pedido
          </CardTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {statusSteps.map((step, index) => (
              <span
                key={step.key}
                className={
                  index <= progressIndex ? "text-primary" : "text-muted-foreground"
                }
              >
                {step.label}
              </span>
            ))}
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{orderDate}</span>
            <span>{orderStatusMeta.label}</span>
          </div>
        </Card>
      )}

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
              <div
                key={`${item.id ?? item.productId ?? item.product?.id}-summary`}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center"
              >
                <img
                  src={getItemImage(item.product?.images)}
                  alt={item.product?.name ?? "Producto"}
                  className="h-20 w-20 rounded-md object-cover"
                />
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-tight">
                    {item.product?.name ?? "Producto"}
                  </p>
                  {item.product?.sku ? (
                    <p className="text-xs text-muted-foreground">
                      SKU: {item.product.sku}
                    </p>
                  ) : null}
                  <div className="text-sm text-muted-foreground">
                    <span>Cantidad: {item.quantity}</span>
                    <span className="mx-2">·</span>
                    <span>{money.format(resolveUnitPrice(item))} c/u</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-base font-semibold">
                    {money.format(resolveUnitPrice(item) * item.quantity)}
                  </p>
                </div>
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
                {order.user.phone || "No disponible"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Método de Pago:
              </span>
              <span className="text-sm flex items-center gap-1">
                Tarjeta de Crédito
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Dirección de Envío:
              </span>
              <span className="text-sm text-right flex items-center text-wrap gap-1">
                {formattedAddress}
              </span>
            </div>
            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{money.format(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Descuentos</span>
                <span className="font-medium text-destructive">
                  -{money.format(order.totalDiscountAmount ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Impuestos</span>
                <span className="font-medium">{money.format(order.taxAmount ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-medium">{money.format(order.shippingAmount ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                <span>Total pagado</span>
                <span>{money.format(order.total)}</span>
              </div>
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
