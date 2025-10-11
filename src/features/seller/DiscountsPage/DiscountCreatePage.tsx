import { useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchUserById } from "@/features/users/api";
import { createDiscount } from "../api";
import type { CreateDiscountPayload } from "../types";

type DiscountFormState = {
  name: string;
  type: "percentage" | "fixed";
  value: string;
  description: string;
  status: string;
};

const initialForm: DiscountFormState = {
  name: "",
  type: "percentage",
  value: "",
  description: "",
  status: "active",
};

export function SellerDiscountCreatePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const [form, setForm] = useState<DiscountFormState>(initialForm);

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id ?? "";

  const validationError = useMemo(() => {
    if (!storeId) return "Necesitas una tienda activa para crear descuentos.";
    if (!form.name.trim()) return "El nombre es obligatorio.";
    const value = Number(form.value);
    if (Number.isNaN(value) || value <= 0)
      return "El valor debe ser mayor a 0.";
    return null;
  }, [form, storeId]);

  const mutation = useMutation({
    mutationFn: (payload: CreateDiscountPayload) => createDiscount(payload),
    onSuccess: () => navigate("/dashboard/seller/discounts", { replace: true }),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationError) return;

    const payload: CreateDiscountPayload = {
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
      description: form.description.trim() || undefined,
      status: form.status,
    };

    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Crear descuento
        </h1>
        <p className="text-sm text-muted-foreground">
          Define un descuento que puedas asociar a tus productos o campañas.
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
                {mutation.isPending ? "Guardando..." : "Crear descuento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
