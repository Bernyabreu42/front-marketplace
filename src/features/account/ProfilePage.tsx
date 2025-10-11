import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAdminUser, updateAdminUser } from "@/features/admin/api";
import { deleteUserAccount } from "@/features/users/api";
import { DangerZoneCard } from "@/features/users/components/DangerZoneCard";
import { getApiErrorMessage } from "@/lib/utils";

const sanitize = (value: string | null | undefined) => value ?? "";

type FormState = {
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  phone: string;
};

type FormValueMap = Record<keyof FormState, string | null | undefined>;

const editableKeys: Array<keyof FormState> = [
  "firstName",
  "lastName",
  "displayName",
  "username",
  "phone",
];

export function AccountProfilePage() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    displayName: "",
    username: "",
    phone: "",
  });
  const [riskError, setRiskError] = useState<string | null>(null);

  const userId = user?.id;

  const userQuery = useQuery({
    queryKey: ["account", "profile", userId],
    queryFn: () => fetchAdminUser(userId!),
    enabled: Boolean(userId),
  });

  const currentUser = userQuery.data?.data;

  useEffect(() => {
    if (currentUser) {
      setForm({
        firstName: sanitize(currentUser.firstName),
        lastName: sanitize(currentUser.lastName),
        displayName: sanitize(currentUser.displayName),
        username: sanitize(currentUser.username),
        phone: sanitize(currentUser.phone),
      });
    }
  }, [currentUser]);

  const mutation = useMutation({
    mutationFn: (payload: Partial<FormState>) => updateAdminUser(userId!, payload),
    onSuccess: (response) => {
      toast.success(response.message ?? "Perfil actualizado");
      queryClient.invalidateQueries({ queryKey: ["account", "profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      refresh();
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Usuario no autenticado");
      return deleteUserAccount(userId);
    },
    onMutate: () => {
      setRiskError(null);
    },
    onSuccess: () => {
      logout()
        .catch(() => undefined)
        .finally(() => navigate("/login", { replace: true }));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "No pudimos eliminar la cuenta";
      setRiskError(message);
    },
  });

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
  };

  const email = currentUser?.email ?? user?.email ?? "";

  const hasChanges = useMemo(() => {
    if (!currentUser) return false;
    const originalValues = currentUser as unknown as FormValueMap;
    return editableKeys.some((key) => {
      const current = sanitize(form[key]).trim();
      const original = sanitize(originalValues[key]).trim();
      return current !== original;
    });
  }, [form, currentUser]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || !userId) return;

    const originalValues = currentUser as unknown as FormValueMap;
    const payload: Partial<FormState> = {};

    editableKeys.forEach((key) => {
      const current = sanitize(form[key]).trim();
      const original = sanitize(originalValues[key]).trim();
      if (current !== original) {
        payload[key] = current;
      }
    });

    if (Object.keys(payload).length === 0) {
      toast.info("No hay cambios para guardar.");
      return;
    }

    mutation.mutate(payload);
  };

  if (!userId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        No pudimos cargar la informacion de tu perfil.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">
          Actualiza los datos basicos de tu cuenta para mantener tu informacion al dia.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Datos personales</CardTitle>
        </CardHeader>
        <CardContent>
          {userQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando informacion...</p>
          ) : !currentUser ? (
            <p className="text-sm text-muted-foreground">No pudimos encontrar tu cuenta.</p>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Correo</p>
                  <p className="text-sm text-foreground">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Estado</p>
                  <p className="text-sm text-foreground capitalize">{currentUser.status}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground" htmlFor="firstName">
                  Nombre
                </label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground" htmlFor="lastName">
                  Apellido
                </label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="displayName">
                  Nombre para mostrar
                </label>
                <Input
                  id="displayName"
                  value={form.displayName}
                  onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground" htmlFor="username">
                  Usuario
                </label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground" htmlFor="phone">
                  Telefono
                </label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <Button type="submit" disabled={!hasChanges || mutation.isPending}>
                  {mutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <DangerZoneCard
        email={email}
        isDeleting={deleteMutation.isPending}
        onDelete={handleDeleteConfirm}
        error={riskError}
      />
    </div>
  );
}
