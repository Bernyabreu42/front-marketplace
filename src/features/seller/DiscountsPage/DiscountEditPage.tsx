import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchDiscount, updateDiscount } from "../api";
import type { DiscountItem, UpdateDiscountPayload } from "../types";

interface DiscountFormState {
  name: string;
  type: "percentage" | "fixed";
  value: string;
  description: string;
  status: string;
}

const EMPTY_FORM: DiscountFormState = {
  name: "",
  type: "percentage",
  value: "",
  description: "",
  status: "active",
};

export function SellerDiscountEditPage() {
  const { discountId } = useParams<{ discountId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<DiscountFormState>(EMPTY_FORM);

  const discountQuery = useQuery({
    queryKey: ["discount", discountId],
    queryFn: () => fetchDiscount(discountId!),
    enabled: Boolean(discountId),
  });

  const discount: DiscountItem | undefined = discountQuery.data?.data;

  useEffect(() => {
    if (!discount) return;
    setForm({
      name: discount.name,
      type: discount.type,
      value: String(discount.value ?? ""),
      description: discount.description ?? "",
      status: discount.status ?? "active",
    });
  }, [discount]);

  const validationError = useMemo(() => {
    if (!form.name.trim()) return "El nombre es obligatorio.";
    const parsed = Number(form.value);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return "El valor debe ser mayor a 0.";
    }
    return null;
  }, [form]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateDiscountPayload) =>
      updateDiscount(discountId!, payload),
    onSuccess: () => navigate("/dashboard/seller/discounts", { replace: true }),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationError || !discountId) return;

    const payload: UpdateDiscountPayload = {
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
      description: form.description.trim() || undefined,
      status: form.status,
    };

    mutation.mutate(payload);
  };

  if (discountQuery.isLoading) {
    return <p>Cargando descuento...</p>;
  }

  if (!discount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Descuento no encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Verifica que el descuento exista o vuelve al listado.
          </p>
          <Button type="button" variant="outline" asChild className="mt-4">
            <Link to="/dashboard/seller/discounts">Volver a descuentos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar descuento
        </h1>
        <p className="text-sm text-muted-foreground">
          Actualiza los parametros de tu descuento existente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Detalles del descuento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="discount-name"
              >
                Nombre
              </label>
              <Input
                id="discount-name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>

            <div>
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="discount-type"
              >
                Tipo
              </label>
              <select
                id="discount-type"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as DiscountFormState["type"],
                  }))
                }
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </select>
            </div>

            <div>
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="discount-value"
              >
                Valor
              </label>
              <Input
                id="discount-value"
                type="number"
                step="0.01"
                min="0"
                value={form.value}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, value: event.target.value }))
                }
                required
              />
            </div>

            <div>
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="discount-status"
              >
                Estado
              </label>
              <select
                id="discount-status"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="discount-description"
              >
                Descripcion
              </label>
              <textarea
                id="discount-description"
                className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            {validationError && (
              <p className="md:col-span-2 text-sm text-destructive">
                {validationError}
              </p>
            )}

            <div className="md:col-span-2 flex items-center justify-between">
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard/seller/discounts">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={Boolean(validationError) || mutation.isPending}
              >
                {mutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
