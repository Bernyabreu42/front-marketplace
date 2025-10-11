import { useMemo, useState } from "react";

import { LineChartCard } from "@/components/LineChartCard";
import { RangeControls } from "@/components/RangeControls";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TopProductsResponse } from "./types";
import {
  useLoyaltySummary,
  useSalesOverview,
  useSalesSeries,
  useTopProducts,
} from "./hooks";

const currency = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function OverviewPage() {
  const [days, setDays] = useState(30);
  const params = useMemo(() => ({ days }), [days]);

  const { data: overview, isLoading: overviewLoading } = useSalesOverview(params);
  const { data: series, isLoading: seriesLoading } = useSalesSeries(params);
  const { data: loyalty, isLoading: loyaltyLoading } = useLoyaltySummary(params);
  const { data: topProducts, isLoading: topLoading } = useTopProducts({ ...params, limit: 5 });

  const overviewData = overview?.data;
  const seriesData = series?.data.points ?? [];
  const loyaltyData = loyalty?.data;
  const products: TopProductsResponse["data"]["products"] = topProducts?.data.products ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resumen general</h1>
          <p className="text-sm text-muted-foreground">
            Metricas clave del marketplace en el periodo seleccionado.
          </p>
        </div>
        <RangeControls currentDays={days} onChange={setDays} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ingresos"
          value={overviewLoading ? "-" : currency.format(overviewData?.totalSales ?? 0)}
          helper="Periodo"
          trend={
            overviewData && {
              value: overviewData.deltaPercent,
              label: "vs periodo anterior",
            }
          }
        />
        <StatCard
          title="Ordenes"
          value={overviewLoading ? "-" : String(overviewData?.totalOrders ?? 0)}
          helper="Periodo"
          trend={
            overviewData && {
              value: overviewData.ordersDeltaPercent,
              label: "vs periodo anterior",
            }
          }
        />
        <StatCard
          title="Clientes nuevos"
          value={overviewLoading ? "-" : String(overviewData?.newCustomers ?? 0)}
          helper="Periodo"
          trend={
            overviewData && {
              value: overviewData.customersDeltaPercent,
              label: "vs periodo anterior",
            }
          }
        />
        <StatCard
          title="Balance puntos"
          value={loyaltyLoading ? "-" : `${loyaltyData?.outstandingBalance ?? 0} pts`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <LineChartCard
          title="Ingresos diarios"
          data={seriesLoading ? [] : seriesData}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Actividad de lealtad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Puntos otorgados</span>
              <span className="font-medium">{loyaltyLoading ? "-" : `${loyaltyData?.pointsIssued ?? 0} pts`}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Puntos redimidos</span>
              <span className="font-medium">{loyaltyLoading ? "-" : `${loyaltyData?.pointsRedeemed ?? 0} pts`}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Saldo vigente</span>
              <span className="font-medium">{loyaltyLoading ? "-" : `${loyaltyData?.outstandingBalance ?? 0} pts`}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Top productos por ingreso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
            {!topLoading && products.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay ventas registradas en este periodo.</p>
            )}
            {!topLoading && products.length > 0 && (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{product.name}</span>
                      <span className="text-muted-foreground">{product.quantity} uds.</span>
                    </div>
                    <span className="font-semibold">{currency.format(product.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
