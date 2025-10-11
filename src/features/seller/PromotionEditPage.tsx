import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchPromotion, updatePromotion } from "./api";
import type { PromotionItem, UpdatePromotionPayload } from "./types";

interface PromotionFormState {
  name: string;
  description: string;
  type: "automatic" | "coupon";
  value: string;
  code: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

const EMPTY_FORM: PromotionFormState = {
  name: "",
  description: "",
  type: "automatic",
  value: "",
  code: "",
  startsAt: "",
  endsAt: "",
  status: "active",
};

const formatDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

const toIsoString = (value: string) =>
  value ? new Date(value).toISOString() : undefined;

export function SellerPromotionEditPage() {
  const { promotionId } = useParams<{ promotionId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<PromotionFormState>(EMPTY_FORM);

  const promotionQuery = useQuery({
    queryKey: ["promotion", promotionId],
    queryFn: () => fetchPromotion(promotionId!),
    enabled: Boolean(promotionId),
  });

  const promotion: PromotionItem | undefined = promotionQuery.data?.data;

  useEffect(() => {
    if (!promotion) return;
    setForm({
      name: promotion.name,
      description: promotion.description ?? "",
      type: promotion.type,
      value:
        promotion.value !== null && promotion.value !== undefined
          ? String(promotion.value)
          : "",
      code: promotion.code ?? "",
      startsAt: formatDateTimeLocal(promotion.startsAt ?? undefined),
      endsAt: formatDateTimeLocal(promotion.endsAt ?? undefined),
      status: promotion.status ?? "active",
    });
  }, [promotion]);

  const validationError = useMemo(() => {
    if (!form.name.trim()) return "El nombre es obligatorio.";
    if (form.type === "coupon" && !form.code.trim()) {
      return "Debes proporcionar un codigo para los cupones.";
    }
    if (form.value) {
      const parsed = Number(form.value);
      if (Number.isNaN(parsed) || parsed <= 0) {
        return "El valor debe ser mayor a 0.";
      }
    }
    if (form.startsAt && form.endsAt) {
      const start = new Date(form.startsAt);
      const end = new Date(form.endsAt);
      if (end < start) {
        return "La fecha de fin debe ser posterior a la de inicio.";
      }
    }
    return null;
  }, [form]);

  const mutation = useMutation({
    mutationFn: (payload: UpdatePromotionPayload) =>
      updatePromotion(promotionId!, payload),
    onSuccess: () => navigate("/dashboard/seller/promotions", { replace: true }),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationError || !promotionId) return;

    const payload: UpdatePromotionPayload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      value: form.value ? Number(form.value) : undefined,
      code: form.code.trim() || undefined,
      startsAt: toIsoString(form.startsAt),
      endsAt: toIsoString(form.endsAt),
      status: form.status,
    };

    mutation.mutate(payload);
  };

  if (promotionQuery.isLoading) {
    return <p>Cargando promocion...</p>;
  }

  if (!promotion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Promocion no encontrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Verifica que la promocion exista o vuelve al listado.
          </p>
          <Button type="button" variant="outline" asChild className="mt-4">
            <Link to="/dashboard/seller/promotions">Volver a promociones</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar promocion</h1>
        <p className="text-sm text-muted-foreground">
          Actualiza los detalles de tu promocion existente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Detalles de la promocion
          </CardTitle>
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
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
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as PromotionFormState["type"],
                  }))
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, value: event.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="promo-code">
                Codigo
              </label>
              <Input
                id="promo-code"
                value={form.code}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, code: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, startsAt: event.target.value }))
                }
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endsAt: event.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground" htmlFor="promo-status">
                Estado
              </label>
              <select
                id="promo-status"
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

            {validationError && (
              <p className="md:col-span-2 text-sm text-destructive">{validationError}</p>
            )}

            <div className="md:col-span-2 flex items-center justify-between">
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard/seller/promotions">Cancelar</Link>
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

