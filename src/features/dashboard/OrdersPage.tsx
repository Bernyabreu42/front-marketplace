import { useMemo, useState } from "react";

import { RangeControls } from "@/components/RangeControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrdersStatus } from "./hooks";

type StatusMeta = {
  label: string;
  badge: string;
};

type OrderStatus = {
  status: string;
  count: number;
};

const STATUS_MAP: Record<string, StatusMeta> = {
  pending: { label: "Pendiente", badge: "bg-yellow-100 text-yellow-800" },
  processing: { label: "En proceso", badge: "bg-blue-100 text-blue-800" },
  paid: { label: "Pagada", badge: "bg-emerald-100 text-emerald-800" },
  shipped: { label: "Enviada", badge: "bg-indigo-100 text-indigo-800" },
  completed: { label: "Completada", badge: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelada", badge: "bg-rose-100 text-rose-700" },
};

export function OrdersPage() {
  const [days, setDays] = useState(30);
  const params = useMemo(() => ({ days }), [days]);
  const { data, isLoading } = useOrdersStatus(params);
  const statuses: OrderStatus[] = data?.data.statuses ?? [];

  const total = statuses.reduce<number>((acc, item) => acc + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estado de ordenes</h1>
          <p className="text-sm text-muted-foreground">
            Distribucion de todas las ordenes creadas en el periodo seleccionado.
          </p>
        </div>
        <RangeControls currentDays={days} onChange={setDays} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen por estado</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {!isLoading && statuses.length === 0 && (
            <p className="text-sm text-muted-foreground">No se encontraron ordenes en este rango.</p>
          )}
          {!isLoading && statuses.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statuses.map((status) => {
                const meta = STATUS_MAP[status.status] ?? {
                  label: status.status,
                  badge: "bg-muted text-muted-foreground",
                };
                const percentage = total ? Math.round((status.count / total) * 100) : 0;
                return (
                  <div key={status.status} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{meta.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.badge}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-foreground">{status.count}</div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
