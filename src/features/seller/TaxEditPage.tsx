import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchTax, updateTax } from "./api";
import type { TaxItem, UpdateTaxPayload } from "./types";

interface TaxFormState {
  name: string;
  type: "percentage" | "fixed";
  rate: string;
  description: string;
  status: string;
}

const EMPTY_FORM: TaxFormState = {
  name: "",
  type: "percentage",
  rate: "",
  description: "",
  status: "active",
};

export function SellerTaxEditPage() {
  const { taxId } = useParams<{ taxId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<TaxFormState>(EMPTY_FORM);

  const taxQuery = useQuery({
    queryKey: ["tax", taxId],
    queryFn: () => fetchTax(taxId!),
    enabled: Boolean(taxId),
  });

  const tax: TaxItem | undefined = taxQuery.data?.data;

  useEffect(() => {
    if (!tax) return;
    setForm({
      name: tax.name,
      type: tax.type,
      rate: String(tax.rate ?? ""),
      description: tax.description ?? "",
      status: tax.status ?? "active",
    });
  }, [tax]);

  const validationError = useMemo(() => {
    if (!form.name.trim()) return "El nombre es obligatorio.";
    const parsed = Number(form.rate);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return "La tasa debe ser mayor a 0.";
    }
    return null;
  }, [form]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateTaxPayload) => updateTax(taxId!, payload),
    onSuccess: () => navigate("/dashboard/seller/taxes", { replace: true }),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationError || !taxId) return;

    const payload: UpdateTaxPayload = {
      name: form.name.trim(),
      type: form.type,
      rate: Number(form.rate),
      description: form.description.trim() || undefined,
      status: form.status,
    };

    mutation.mutate(payload);
  };

  if (taxQuery.isLoading) {
    return <p>Cargando impuesto...</p>;
  }

  if (!tax) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impuesto no encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Verifica que el impuesto exista o vuelve al listado.
          </p>
          <Button type="button" variant="outline" asChild className="mt-4">
            <Link to="/dashboard/seller/taxes">Volver a impuestos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar impuesto</h1>
        <p className="text-sm text-muted-foreground">
          Ajusta la informacion de tu impuesto existente.
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
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
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as TaxFormState["type"],
                  }))
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, rate: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
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
                {mutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

