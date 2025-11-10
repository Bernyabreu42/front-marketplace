import type { LoyaltyTransaction, OrderSummary } from "./types";
import { useMemo } from "react";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLoyaltyAccount, useMyOrders } from "./hooks";

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

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

const dateTime = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function BuyerOverviewPage() {
  const { user } = useAuth();
  const { data: ordersData, isLoading: ordersLoading } = useMyOrders({
    page: 1,
    limit: 5,
  });
  const { data: loyaltyData, isLoading: loyaltyLoading } = useLoyaltyAccount({
    limit: 5,
  });

  const totalOrders = ordersData?.pagination.total ?? 0;
  const recentOrders: OrderSummary[] = ordersData?.data ?? [];

  const loyaltySummary = loyaltyData?.data.account;
  const transactions: LoyaltyTransaction[] =
    loyaltyData?.data.transactions ?? [];
  const redeemablePoints = loyaltyData?.data.redeemablePoints ?? 0;
  const redeemableAmount = loyaltyData?.data.redeemableAmount ?? 0;

  const displayName = useMemo(() => {
    const raw =
      user?.displayName ?? user?.firstName ?? user?.email ?? "Tu cuenta";
    return raw?.toString().trim() || "Tu cuenta";
  }, [user?.displayName, user?.firstName, user?.email]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Revisa de un vistazo tus pedidos, puntos y datos importantes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ordenes totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {ordersLoading ? "-" : totalOrders}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Puntos disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {loyaltyLoading ? "-" : `${loyaltySummary?.balance ?? 0} pts`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Puntos canjeables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-semibold text-foreground">
              {loyaltyLoading ? "-" : `${redeemablePoints} pts`}
            </p>
            <p className="text-xs text-muted-foreground">
              Equivalente a{" "}
              {loyaltyLoading ? "-" : money.format(redeemableAmount)} en
              compras.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Tus ultimas ordenes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {ordersLoading && (
              <p className="text-muted-foreground">Cargando ordenes...</p>
            )}
            {!ordersLoading && recentOrders.length === 0 && (
              <p className="text-muted-foreground">
                No tienes ordenes registradas todavia. Empieza a comprar en el
                marketplace.
              </p>
            )}
            {!ordersLoading && recentOrders.length > 0 && (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const meta = statusMeta[order.status] ?? {
                    label: order.status,
                    variant: "outline" as const,
                  };
                  const itemsLabel =
                    order.items
                      .map((item) => item.product?.name)
                      .filter(Boolean)
                      .join(", ") || "Sin detalles";
                  return (
                    <div
                      key={order.id}
                      className="rounded-lg border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-foreground">
                              Orden #{order.id.slice(0, 8)}
                            </span>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {dateTime.format(new Date(order.createdAt))}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {money.format(order.total)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {itemsLabel}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="h-max">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Actividad de puntos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {loyaltyLoading && (
              <p className="text-muted-foreground">Cargando movimientos...</p>
            )}
            {!loyaltyLoading && transactions.length === 0 && (
              <p className="text-muted-foreground">
                Aun no tienes movimientos en tu cuenta de lealtad.
              </p>
            )}
            {!loyaltyLoading && transactions.length > 0 && (
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const actionLabel =
                    tx.action?.name ?? tx.description ?? "Movimiento";
                  const formattedDate = dateTime.format(new Date(tx.createdAt));
                  const pointsLabel = `${tx.points > 0 ? "+" : ""}${
                    tx.points
                  } pts`;
                  return (
                    <div
                      key={tx.id}
                      className="rounded-lg border border-border bg-card px-3 py-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">
                          {actionLabel}
                        </span>
                        <span
                          className={[
                            "font-semibold",
                            tx.points >= 0
                              ? "text-emerald-600"
                              : "text-rose-600",
                          ].join(" ")}
                        >
                          {pointsLabel}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="text-xs text-muted-foreground">
                        {formattedDate}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
