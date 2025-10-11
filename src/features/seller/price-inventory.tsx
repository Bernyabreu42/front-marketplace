import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PricePreviewStep, ProductFormState } from "./ProductEditPage";

interface PriceInventoryProps {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  currencyFormatter: Intl.NumberFormat;
  formatCurrency: (value: number) => string;
  priceSteps: PricePreviewStep[];
}

export default function PriceInventory({
  form,
  setForm,
  formatCurrency,
  priceSteps,
}: PriceInventoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Precios e inventario
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Define el precio base y la cantidad disponible.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product-price">Precio base *</Label>
          <Input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, price: event.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-stock">Inventario *</Label>
          <Input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, stock: event.target.value }))
            }
            required
          />
        </div>
        <div className="md:col-span-2 space-y-3 rounded-md border bg-muted/60 px-4 py-3">
          <div className="space-y-2 text-sm">
            {priceSteps.map((step) => {
              const isTotal = step.kind === "total";
              const isBase = step.kind === "base";
              const showChange = !isBase && !isTotal && step.change !== 0;
              return (
                <div
                  key={step.id}
                  className={`flex items-start justify-between gap-3 ${
                    isTotal
                      ? "border-t border-border/70 pt-2 text-base font-semibold"
                      : ""
                  }`}
                >
                  <div>
                    <span className={isTotal ? "font-semibold" : ""}>
                      {step.label}
                    </span>
                    {step.detail && (
                      <span className="block text-xs text-muted-foreground">
                        {step.detail}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {showChange && (
                      <span
                        className={`block text-xs ${
                          step.change < 0
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {step.change < 0 ? "-" : "+"}{" "}
                        {formatCurrency(Math.abs(step.change))}
                      </span>
                    )}
                    <span className={isTotal ? "text-base font-semibold" : ""}>
                      {formatCurrency(step.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            El precio final se calcula automaticamente considerando impuestos,
            promociones y descuentos activos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
