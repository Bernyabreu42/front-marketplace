import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SellerUpgradeCard } from "@/features/buyer/components/SellerUpgradeCard";
import { deleteUserAccount, fetchUserById, updateUserProfile } from "@/features/users/api";
import { DangerZoneCard } from "@/features/users/components/DangerZoneCard";
import type { UserProfile } from "@/features/users/types";

const fields: Array<{ key: keyof ProfileFormState; label: string; placeholder?: string }> = [
  { key: "firstName", label: "Nombre" },
  { key: "lastName", label: "Apellido" },
  { key: "displayName", label: "Nombre para mostrar" },
  { key: "username", label: "Nombre de usuario", placeholder: "ej. juanr" },
  { key: "phone", label: "Telefono", placeholder: "+1 809 555 5555" },
];

type ProfileFormState = {
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  phone: string;
};

const sanitize = (value: string | null | undefined) => {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export function BuyerProfilePage() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    displayName: "",
    username: "",
    phone: "",
  });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [riskError, setRiskError] = useState<string | null>(null);

  const userId = user?.id;

  const profileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    const profile = profileQuery.data?.data;
    if (profile) {
      setForm({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        displayName: profile.displayName ?? "",
        username: profile.username ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profileQuery.data?.data]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<UserProfile>) => {
      if (!userId) throw new Error("Usuario no autenticado");
      return updateUserProfile(userId, payload);
    },
    onSuccess: (response) => {
      setFeedback({ type: "success", message: response.message ?? "Datos actualizados" });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      refresh();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "No se pudo actualizar";
      setFeedback({ type: "error", message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Usuario no autenticado");
      return deleteUserAccount(user.id);
    },
    onMutate: () => {
      setRiskError(null);
    },
    onSuccess: () => {
      logout()
        .catch(() => undefined)
        .finally(() => navigate("/login", { replace: true }));
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "No pudimos eliminar la cuenta";
      setRiskError(message);
    },
  });

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const profile = profileQuery.data?.data;
    if (!profile || !userId) {
      setFeedback({ type: "error", message: "No pudimos cargar tu informacion." });
      return;
    }

    const payload: Record<string, string | null> = {};
    (Object.keys(form) as Array<keyof ProfileFormState>).forEach((key) => {
      const formValue = sanitize(form[key]);
      const original = sanitize(profile[key] as string | null | undefined);
      if (formValue !== original) {
        payload[key] = formValue;
      }
    });

    if (Object.keys(payload).length === 0) {
      setFeedback({ type: "error", message: "No hay cambios para guardar." });
      return;
    }

    updateMutation.mutate(payload);
  };

  const isLoading = profileQuery.isLoading;
  const profile = profileQuery.data?.data;

  const email = useMemo(
    () => profile?.email ?? user?.email ?? "",
    [profile?.email, user?.email]
  );
  const sellerUpgrade = user?.role === "buyer" ? user?.sellerUpgrade ?? null : null;

  const handleUpgradeCompleted = useCallback(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    }
    refresh();
    navigate("/dashboard/seller", { replace: true });
  }, [queryClient, refresh, userId, navigate]);

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return (Object.keys(form) as Array<keyof ProfileFormState>).some((key) => {
      const formValue = sanitize(form[key]);
      const original = sanitize(profile[key] as string | null | undefined);
      return formValue !== original;
    });
  }, [form, profile]);

  const userEmail = user?.email ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Perfil personal</h1>
        <p className="text-sm text-muted-foreground">
          Actualiza tus datos de contacto y gestiona la seguridad de tu cuenta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Informacion basica</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando tu informacion...</p>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Correo</label>
                <Input value={email} disabled className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Tu correo es tu identificador principal y no puede modificarse desde el panel.
                </p>
              </div>

              {fields.map(({ key, label, placeholder }) => (
                <div key={key.toString()} className={key === "displayName" ? "md:col-span-2" : ""}>
                  <label className="text-sm font-medium text-muted-foreground" htmlFor={key}>
                    {label}
                  </label>
                  <Input
                    id={key}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [key]: event.target.value }))
                    }
                  />
                </div>
              ))}

              {feedback && (
                <p
                  className={cn(
                    "md:col-span-2 text-sm",
                    feedback.type === "success" ? "text-emerald-600" : "text-destructive"
                  )}
                >
                  {feedback.message}
                </p>
              )}

              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <Button type="submit" disabled={!hasChanges || updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {sellerUpgrade && (
        <SellerUpgradeCard upgrade={sellerUpgrade} onCompleted={handleUpgradeCompleted} />
      )}

      <DangerZoneCard
        email={userEmail}
        isDeleting={deleteMutation.isPending}
        onDelete={handleDeleteConfirm}
        error={riskError}
      />
    </div>
  );
}


