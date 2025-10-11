import { useMemo, useState } from "react";

import { RangeControls } from "@/components/RangeControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopProductsResponse } from "./types";
import { useTopProducts } from "./hooks";

const currency = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function ProductsPage() {
  const [days, setDays] = useState(30);
  const params = useMemo(() => ({ days, limit: 10 }), [days]);
  const { data, isLoading } = useTopProducts(params);
  const products: TopProductsResponse["data"]["products"] = data?.data.products ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos destacados</h1>
          <p className="text-sm text-muted-foreground">
            Ranking de productos segun ingresos generados en el periodo seleccionado.
          </p>
        </div>
        <RangeControls currentDays={days} onChange={setDays} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top productos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {!isLoading && products.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay productos con ventas en este periodo.</p>
          )}
          {!isLoading && products.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Unidades</th>
                    <th className="px-4 py-3">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {products.map((product) => (
                    <tr key={product.productId} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.quantity}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {currency.format(product.revenue)}
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
