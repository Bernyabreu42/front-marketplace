import { useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchUserById } from "@/features/users/api";
import { createTax } from "./api";
import type { CreateTaxPayload } from "./types";

type TaxFormState = {
  name: string;
  type: "percentage" | "fixed";
  rate: string;
  description: string;
  status: string;
};

const initialForm: TaxFormState = {
  name: "",
  type: "percentage",
  rate: "",
  description: "",
  status: "active",
};

export function SellerTaxCreatePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const [form, setForm] = useState<TaxFormState>(initialForm);

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id ?? "";

  const validationError = useMemo(() => {
    if (!storeId) return "Necesitas una tienda activa para registrar impuestos.";
    if (!form.name.trim()) return "El nombre es obligatorio.";
    const rate = Number(form.rate);
    if (Number.isNaN(rate) || rate <= 0) return "La tasa debe ser mayor a 0.";
    return null;
  }, [form, storeId]);

  const mutation = useMutation({
    mutationFn: (payload: CreateTaxPayload) => createTax(payload),
    onSuccess: () => navigate("/dashboard/seller/taxes", { replace: true }),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationError) return;

    const payload: CreateTaxPayload = {
      name: form.name.trim(),
      type: form.type,
      rate: Number(form.rate),
      description: form.description.trim() || undefined,
      status: form.status,
    };

    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Registrar impuesto</h1>
        <p className="text-sm text-muted-foreground">
          Configura un impuesto que se aplicara automaticamente a tus productos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Detalles del impuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="tax-name">
                Nombre
              </label>
              <Input
                id="tax-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="tax-type">
                Tipo
              </label>
              <select
                id="tax-type"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value as TaxFormState["type"] }))
                }
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="tax-rate">
                Tasa
              </label>
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                min="0"
                value={form.rate}
                onChange={(event) => setForm((prev) => ({ ...prev, rate: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="tax-status">
                Estado
              </label>
              <select
                id="tax-status"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="tax-description">
                Descripcion
              </label>
              <textarea
                id="tax-description"
                className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>

            {validationError && (
              <p className="md:col-span-2 text-sm text-destructive">{validationError}</p>
            )}

            <div className="md:col-span-2 flex items-center justify-between">
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard/seller/taxes">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={Boolean(validationError) || mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Registrar impuesto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
