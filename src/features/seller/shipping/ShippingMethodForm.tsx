import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateShippingMethodPayload, ShippingMethod } from "../types";

interface ShippingMethodFormProps {
  defaultValues?: ShippingMethod;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (payload: CreateShippingMethodPayload) => void;
  onCancel?: () => void;
}

interface FormState {
  name: string;
  cost: string;
  description: string;
}

const initialState: FormState = {
  name: "",
  cost: "",
  description: "",
};

export function ShippingMethodForm({
  defaultValues,
  submitting = false,
  submitLabel = "Guardar",
  onSubmit,
  onCancel,
}: ShippingMethodFormProps) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setFormState({
        name: defaultValues.name,
        cost: String(defaultValues.price ?? ""),
        description: defaultValues.description ?? "",
      });
    } else {
      setFormState(initialState);
    }
  }, [defaultValues]);

  const nameError = useMemo(() => {
    if (!formState.name.trim()) return "El nombre es obligatorio";
    if (formState.name.trim().length < 3)
      return "El nombre debe tener al menos 3 caracteres";
    return null;
  }, [formState.name]);

  const priceInfo = useMemo(() => {
    if (!formState.cost.trim()) {
      return { value: NaN, error: "El precio es obligatorio" };
    }
    const parsed = Number(formState.cost);
    if (Number.isNaN(parsed)) {
      return { value: NaN, error: "El precio debe ser un numero" };
    }
    if (parsed < 0) {
      return { value: parsed, error: "El precio no puede ser negativo" };
    }
    return { value: parsed, error: null };
  }, [formState.cost]);

  const hasErrors = Boolean(nameError || priceInfo.error);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (hasErrors) return;

    onSubmit({
      name: formState.name.trim(),
      price: Number(priceInfo.value.toFixed(2)),
      description: formState.description.trim()
        ? formState.description.trim()
        : undefined,
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="shipping-name">Nombre</Label>
        <Input
          id="shipping-name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Entrega estandar"
          required
        />
        {attemptedSubmit && nameError && (
          <p className="text-sm text-destructive">{nameError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shipping-price">Precio</Label>
        <Input
          id="shipping-price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formState.cost}
          onChange={handleChange}
          placeholder="149.99"
          required
        />
        {attemptedSubmit && priceInfo.error && (
          <p className="text-sm text-destructive">{priceInfo.error}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shipping-description">Descripcion (opcional)</Label>
        <Textarea
          id="shipping-description"
          name="description"
          value={formState.description}
          onChange={handleChange}
          placeholder="Detalle tiempos de entrega, cobertura u otras condiciones"
          className="min-h-[100px]"
        />
      </div>

      <div className="flex items-center justify-between">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          disabled={submitting || (hasErrors && attemptedSubmit)}
        >
          {submitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
