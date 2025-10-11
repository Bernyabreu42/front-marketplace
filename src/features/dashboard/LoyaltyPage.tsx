import { useMemo, useState } from "react";

import { RangeControls } from "@/components/RangeControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoyaltySummary } from "./hooks";

export function LoyaltyPage() {
  const [days, setDays] = useState(30);
  const params = useMemo(() => ({ days }), [days]);
  const { data, isLoading } = useLoyaltySummary(params);
  const summary = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Programa de lealtad</h1>
          <p className="text-sm text-muted-foreground">
            Monitorea la emision y redencion de puntos dentro del marketplace.
          </p>
        </div>
        <RangeControls currentDays={days} onChange={setDays} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Puntos emitidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {isLoading ? "-" : `${summary?.pointsIssued ?? 0} pts`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Puntos redimidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {isLoading ? "-" : `${summary?.pointsRedeemed ?? 0} pts`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo vigente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {isLoading ? "-" : `${summary?.outstandingBalance ?? 0} pts`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Notas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            - Los puntos emitidos consideran todas las acciones positivas registradas por el backend en el rango.
          </p>
          <p>- El saldo vigente corresponde a la suma de los balances de cada cuenta de lealtad.</p>
          <p>
            - Para investigar discrepancias revisa las transacciones de usuarios especificos desde el modulo de administracion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
