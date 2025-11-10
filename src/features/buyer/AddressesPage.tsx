import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddresses } from "./hooks";
import { createAddress, deleteAddress, updateAddress } from "./api";
import { getApiErrorMessage } from "@/lib/utils";
import type { UserAddress, UserAddressPayload } from "./types";

const createEmptyForm = () => ({
  label: "",
  country: "",
  state: "",
  city: "",
  postalCode: "",
  street: "",
  note: "",
  isDefault: false,
});

type AddressFormState = ReturnType<typeof createEmptyForm>;

type UpsertVariables = {
  addressId?: string;
  values: AddressFormState;
};

export function BuyerAddressesPage() {
  const { data, isLoading } = useAddresses();
  const queryClient = useQueryClient();

  const addresses = data?.data ?? [];

  const [formValues, setFormValues] = useState<AddressFormState>(createEmptyForm());
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const resetForm = () => {
    setFormValues(createEmptyForm());
    setEditingAddress(null);
  };

  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  }, [addresses]);

  const upsertMutation = useMutation({
    mutationFn: async ({ addressId, values }: UpsertVariables) => {
      const payload = mapFormToPayload(values);
      if (addressId) {
        return updateAddress(addressId, payload);
      }
      return createAddress(payload);
    },
    onSuccess: (response) => {
      toast.success(response.message ?? "Direccion guardada");
      queryClient
        .invalidateQueries({ queryKey: ["buyer", "addresses"] })
        .catch(() => undefined);
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (addressId: string) => deleteAddress(addressId),
    onSuccess: (response) => {
      toast.success(response.message ?? "Direccion eliminada");
      queryClient
        .invalidateQueries({ queryKey: ["buyer", "addresses"] })
        .catch(() => undefined);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormValues(mapAddressToForm(address));
    setDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    upsertMutation.mutate({
      addressId: editingAddress?.id,
      values: formValues,
    });
  };

  const handleDelete = (address: UserAddress) => {
    if (!window.confirm("¿Eliminar esta direccion?")) return;
    deleteMutation.mutate(address.id);
  };

  const handleSetDefault = (address: UserAddress) => {
    if (address.isDefault) return;
    upsertMutation.mutate({
      addressId: address.id,
      values: {
        ...mapAddressToForm(address),
        isDefault: true,
      },
    });
  };

  const isSaving = upsertMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis direcciones</h1>
          <p className="text-sm text-muted-foreground">
            Administra las direcciones de envio que usaras durante el checkout.
          </p>
        </div>
        <Button type="button" onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Agregar direccion
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">Direcciones guardadas</CardTitle>
          {addresses.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {addresses.length} direccion{addresses.length === 1 ? "" : "es"}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando direcciones...</p>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8 text-center">
              <MapPin className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">Aun no registras direcciones</p>
                <p className="text-sm text-muted-foreground">
                  Agrega una direccion para agilizar tus compras y envios.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={handleOpenCreate}>
                Agregar primera direccion
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedAddresses.map((address) => (
                <Card key={address.id} className="border border-border/80">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {address.label || "Sin etiqueta"}
                        </p>
                        {address.isDefault && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Predeterminada
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(address)}
                          aria-label="Editar direccion"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(address)}
                          aria-label="Eliminar direccion"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {renderAddressLines(address)}
                    </div>
                    {!address.isDefault && (
                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address)}
                          disabled={isSaving}
                        >
                          Usar como predeterminada
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && isSaving) return;
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Editar direccion" : "Nueva direccion"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="address-label">Etiqueta</Label>
              <Input
                id="address-label"
                value={formValues.label}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, label: event.target.value }))
                }
                placeholder="Casa, Oficina..."
                disabled={isSaving}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address-country">Pais</Label>
                <Input
                  id="address-country"
                  value={formValues.country}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, country: event.target.value }))
                  }
                  placeholder="Republica Dominicana"
                  disabled={isSaving}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-state">Estado/Provincia</Label>
                <Input
                  id="address-state"
                  value={formValues.state}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, state: event.target.value }))
                  }
                  placeholder="Distrito Nacional"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address-city">Ciudad</Label>
                <Input
                  id="address-city"
                  value={formValues.city}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, city: event.target.value }))
                  }
                  placeholder="Santo Domingo"
                  disabled={isSaving}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-postal">Codigo postal</Label>
                <Input
                  id="address-postal"
                  value={formValues.postalCode}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, postalCode: event.target.value }))
                  }
                  placeholder="10101"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address-street">Calle y numero</Label>
              <Textarea
                id="address-street"
                value={formValues.street}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, street: event.target.value }))
                }
                placeholder="Calle Principal #123"
                disabled={isSaving}
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address-note">Referencia</Label>
              <Textarea
                id="address-note"
                value={formValues.note}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, note: event.target.value }))
                }
                placeholder="Frente al parque central"
                disabled={isSaving}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-dashed border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Marcar como predeterminada</p>
                <p className="text-xs text-muted-foreground">
                  Se usara automaticamente en nuevas compras.
                </p>
              </div>
              <Switch
                checked={formValues.isDefault}
                onCheckedChange={(checked) =>
                  setFormValues((prev) => ({ ...prev, isDefault: checked }))
                }
                disabled={isSaving}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isSaving) return;
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : editingAddress ? "Guardar cambios" : "Crear direccion"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function mapAddressToForm(address: UserAddress): AddressFormState {
  const details = address.address;
  return {
    label: address.label ?? "",
    country: details.country ?? "",
    state: details.state ?? "",
    city: details.city ?? "",
    postalCode: details.postalCode ?? "",
    street: details.street ?? "",
    note: details.note ?? "",
    isDefault: address.isDefault,
  };
}

function mapFormToPayload(values: AddressFormState): UserAddressPayload {
  const normalize = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  return {
    label: normalize(values.label) ?? null,
    country: normalize(values.country),
    state: normalize(values.state),
    city: normalize(values.city),
    postalCode: normalize(values.postalCode),
    street: normalize(values.street),
    note: normalize(values.note),
    isDefault: values.isDefault,
  };
}

function renderAddressLines(address: UserAddress) {
  const details = address.address;
  const parts = [
    details.street,
    [details.city, details.state].filter(Boolean).join(", "),
    details.postalCode,
    details.country,
  ].filter((value) => Boolean(value && value.toString().trim().length));

  return (
    <div className="space-y-1">
      {parts.map((line, index) => (
        <p key={`${address.id}-line-${index}`}>{line}</p>
      ))}
      {details.note && (
        <p className="text-xs text-muted-foreground/80">Referencia: {details.note}</p>
      )}
    </div>
  );
}

