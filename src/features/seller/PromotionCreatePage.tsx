import { useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchUserById } from "@/features/users/api";
import { createPromotion } from "./api";
import type { CreatePromotionPayload } from "./types";

type PromotionFormState = {
  name: string;
  description: string;
  type: "automatic" | "coupon";
  value: string;
  code: string;
  startsAt: string;
  endsAt: string;
  status: string;
};

const initialForm: PromotionFormState = {
  name: "",
  description: "",
  type: "automatic",
  value: "",
  code: "",
  startsAt: "",
  endsAt: "",
  status: "active",
};

export function SellerPromotionCreatePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const [form, setForm] = useState<PromotionFormState>(initialForm);

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id ?? "";

  const validationError = useMemo(() => {
    if (!storeId) return "Necesitas una tienda activa para crear promociones.";
    if (!form.name.trim()) return "El nombre es obligatorio.";
    if (form.type === "coupon" && !form.code.trim()) return "Debes proporcionar un codigo para los cupones.";
    if (form.value) {
      const parsed = Number(form.value);
      if (Number.isNaN(parsed) || parsed <= 0) return "El valor debe ser un numero mayor a 0.";
    }
    if (form.startsAt && form.endsAt && new Date(form.endsAt) < new Date(form.startsAt)) {
      return "La fecha de fin debe ser posterior a la de inicio.";
    }
    return null;
  }, [form, storeId]);

  const mutation = useMutation({
    mutationFn: (payload: CreatePromotionPayload) => createPromotion(payload),
    onSuccess: () => navigate("/dashboard/seller/promotions", { replace: true }),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationError) return;

    const payload: CreatePromotionPayload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      value: form.value ? Number(form.value) : undefined,
      code: form.code.trim() || undefined,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      status: form.status,
    };

    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear promocion</h1>
        <p className="text-sm text-muted-foreground">
          Configura una promocion para impulsar las ventas de tus productos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Detalles de la promocion</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="promo-name">
                Nombre
              </label>
              <Input
                id="promo-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="promo-description">
                Descripcion
              </label>
              <textarea
                id="promo-description"
                className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="promo-type">
                Tipo
              </label>
              <select
                id="promo-type"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value as PromotionFormState["type"] }))
                }
              >
                <option value="automatic">Automatica</option>
                <option value="coupon">Cupon</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="promo-value">
                Valor (opcional)
              </label>
              <Input
                id="promo-value"
                type="number"
                step="0.01"
                min="0"
                value={form.value}
                onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="promo-code">
                Codigo
              </label>
              <Input
                id="promo-code"
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                placeholder={form.type === "coupon" ? "Necesario" : "Opcional"}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="promo-starts">
                Inicio
              </label>
              <Input
                id="promo-starts"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="promo-ends">
                Fin
              </label>
              <Input
                id="promo-ends"
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
              />
            </div>

            {validationError && (
              <p className="md:col-span-2 text-sm text-destructive">{validationError}</p>
            )}

            <div className="md:col-span-2 flex items-center justify-between">
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard/seller/promotions">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={Boolean(validationError) || mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Crear promocion"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
