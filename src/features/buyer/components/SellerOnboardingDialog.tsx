import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createStore } from "@/features/seller/api";
import type { CreateStorePayload, StoreAddress } from "@/features/seller/types";
import {
  createEmptyAddress,
  sanitizeStoreAddress,
} from "@/features/seller/utils/address";
import { getApiErrorMessage } from "@/lib/utils";

type SellerOnboardingDialogProps = {
  onCompleted: () => void;
  onClose: () => void;
};

type FormState = {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: StoreAddress;
};

const createInitialFormState = (): FormState => ({
  name: "",
  tagline: "",
  description: "",
  email: "",
  phone: "",
  address: createEmptyAddress(),
});

const sanitizeOptional = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function SellerOnboardingDialog({
  onCompleted,
  onClose,
}: SellerOnboardingDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(createInitialFormState);
  const [touched, setTouched] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: CreateStorePayload) => createStore(payload),
    onSuccess: (response) => {
      toast.success(
        response.message ?? "Solicitud enviada. Estamos revisando tu tienda."
      );
      setForm(createInitialFormState());
      setTouched(false);
      const storeId = response.data?.id;
      queryClient
        .invalidateQueries({ queryKey: ["seller", "store"] })
        .catch(() => undefined);
      if (storeId) {
        queryClient
          .invalidateQueries({ queryKey: ["seller", "store", storeId] })
          .catch(() => undefined);
      }
      onCompleted();
      onClose();
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const isValid = useMemo(() => {
    return form.name.trim().length >= 2 && form.description.trim().length >= 10;
  }, [form.description, form.name]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (!isValid || mutation.isPending) return;

    const addressPayload = sanitizeStoreAddress(form.address);

    const payload: CreateStorePayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      tagline: sanitizeOptional(form.tagline),
      email: sanitizeOptional(form.email)?.toLowerCase() ?? null,
      phone: sanitizeOptional(form.phone),
      address: addressPayload,
    };

    mutation.mutate(payload);
  };

  const descriptionChars = form.description.length;

  return (
    <DialogContent className="overflow-auto max-h-[90%]">
      <DialogHeader>
        <DialogTitle>Convertirme en vendedor</DialogTitle>
        <DialogDescription>
          Proporciona los datos iniciales de tu tienda. Revisaremos tu solicitud
          y te notificaremos cuando este lista para publicar productos.
        </DialogDescription>
      </DialogHeader>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="store-name">Nombre de la tienda</Label>
          <Input
            id="store-name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Ej. Mercado La Esquina"
            required
            minLength={2}
            disabled={mutation.isPending}
          />
          {touched && form.name.trim().length < 2 && (
            <p className="text-xs text-destructive">
              Introduce al menos 2 caracteres.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="store-tagline">Eslogan (opcional)</Label>
          <Input
            id="store-tagline"
            value={form.tagline}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, tagline: event.target.value }))
            }
            placeholder="Una breve frase sobre tu tienda"
            disabled={mutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="store-description">Descripcion</Label>
          <Textarea
            id="store-description"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Cuenta a los clientes que venderas y por que deberian elegir tu tienda."
            minLength={10}
            required
            disabled={mutation.isPending}
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            {descriptionChars}/2000 caracteres.
          </p>
          {touched && form.description.trim().length < 10 && (
            <p className="text-xs text-destructive">
              Describe tu tienda con al menos 10 caracteres.
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="store-email">Correo de contacto (opcional)</Label>
            <Input
              id="store-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="tienda@ejemplo.com"
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-phone">Telefono (opcional)</Label>
            <Input
              id="store-phone"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
              placeholder="+1 809 000 0000"
              disabled={mutation.isPending}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Direccion de la tienda (opcional)
            </p>
            <p className="text-xs text-muted-foreground">
              Completa los campos que apliquen para ayudar a tus clientes a
              ubicarse.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store-country">Pais</Label>
              <Input
                id="store-country"
                value={form.address.country}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    address: { ...prev.address, country: event.target.value },
                  }))
                }
                placeholder="Republica Dominicana"
                disabled={mutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-city">Ciudad</Label>
              <Input
                id="store-city"
                value={form.address.city}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    address: { ...prev.address, city: event.target.value },
                  }))
                }
                placeholder="Santo Domingo"
                disabled={mutation.isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store-state">Estado/Provincia</Label>
              <Input
                id="store-state"
                value={form.address.state}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    address: { ...prev.address, state: event.target.value },
                  }))
                }
                placeholder="Distrito Nacional"
                disabled={mutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-postal">Codigo postal</Label>
              <Input
                id="store-postal"
                value={form.address.postalCode}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      postalCode: event.target.value,
                    },
                  }))
                }
                placeholder="10101"
                disabled={mutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-street">Calle y numero</Label>
            <Input
              id="store-street"
              value={form.address.street}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  address: { ...prev.address, street: event.target.value },
                }))
              }
              placeholder="Calle Principal #123"
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-note">Referencia (opcional)</Label>
            <Input
              id="store-note"
              value={form.address.note}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  address: { ...prev.address, note: event.target.value },
                }))
              }
              placeholder="Frente al parque central"
              disabled={mutation.isPending}
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
