import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAdminUser, updateAdminUser } from "./api";
import type { AdminUser } from "./types";

const ROLES = ["admin", "support", "seller", "buyer"] as const;
const STATUSES = ["active", "disabled"] as const;

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  username: string;
  phone: string;
  role: AdminUser["role"];
  status: AdminUser["status"];
};

type EditableKey = keyof FormState;

const editableKeys: EditableKey[] = [
  "firstName",
  "lastName",
  "displayName",
  "username",
  "phone",
  "role",
  "status",
];

const sanitize = (value: string | null | undefined) => {
  if (value === null || value === undefined) return "";
  return value;
};

export function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    displayName: "",
    username: "",
    phone: "",
    role: "buyer",
    status: "active",
  });
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const userQuery = useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => fetchAdminUser(userId!),
    enabled: Boolean(userId),
  });

  const user = userQuery.data?.data;

  useEffect(() => {
    if (user) {
      setForm({
        firstName: sanitize(user.firstName),
        lastName: sanitize(user.lastName),
        email: sanitize(user.email),
        displayName: sanitize(user.displayName),
        username: sanitize(user.username),
        phone: sanitize(user.phone),
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (payload: Partial<FormState>) =>
      updateAdminUser(userId!, payload),
    onSuccess: (response) => {
      setFeedback({
        type: "success",
        message: response.message ?? "Usuario actualizado",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      userQuery.refetch();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos actualizar el usuario";
      setFeedback({ type: "error", message });
    },
  });

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return editableKeys.some((key) => {
      const current = sanitize(form[key]).trim();
      const original = sanitize(user[key] as string | null | undefined).trim();
      return current !== original;
    });
  }, [form, user]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const payload: Partial<FormState> = {};
    editableKeys.forEach((key) => {
      const current = sanitize(form[key]).trim();
      const original = sanitize(user[key] as string | null | undefined).trim();
      if (current !== original) {
        if (key === "role" || key === "status") {
          payload[key] = form[key];
        } else {
          payload[key] = current;
        }
      }
    });

    if (Object.keys(payload).length === 0) {
      setFeedback({ type: "error", message: "No hay cambios para guardar." });
      return;
    }

    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Detalle de usuario
          </h1>
          <p className="text-sm text-muted-foreground">
            Actualiza los datos del usuario y gestiona su rol dentro del
            marketplace.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Informacion del usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">
              Cargando informacion...
            </p>
          ) : !user ? (
            <p className="text-sm text-muted-foreground">
              No pudimos cargar el usuario solicitado.
            </p>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label
                  className="text-sm font-medium text-muted-foreground"
                  htmlFor="firstName"
                >
                  Nombre
                </label>
                <Input
                  id="firstName"
                  disabled
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      firstName: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-muted-foreground"
                  htmlFor="lastName"
                >
                  Apellido
                </label>
                <Input
                  id="lastName"
                  disabled
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      lastName: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-muted-foreground"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  disabled
                  id="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="">
                <label
                  className="text-sm font-medium text-muted-foreground"
                  htmlFor="displayName"
                >
                  Nombre para mostrar
                </label>
                <Input
                  id="displayName"
                  disabled
                  value={form.displayName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      displayName: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-muted-foreground"
                  htmlFor="username"
                >
                  Usuario
                </label>
                <Input
                  id="username"
                  disabled
                  value={form.username}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-muted-foreground"
                  htmlFor="phone"
                >
                  Telefono
                </label>
                <Input
                  id="phone"
                  disabled
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-muted-foreground"
                  htmlFor="role"
                >
                  Rol
                </label>
                <select
                  id="role"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.role}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      role: event.target.value as FormState["role"],
                    }))
                  }
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="text-sm font-medium text-muted-foreground"
                  htmlFor="status"
                >
                  Estado
                </label>
                <select
                  id="status"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as FormState["status"],
                    }))
                  }
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {feedback && (
                <p
                  className={`md:col-span-2 text-sm ${
                    feedback.type === "success"
                      ? "text-emerald-600"
                      : "text-destructive"
                  }`}
                >
                  {feedback.message}
                </p>
              )}

              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <Button
                  type="submit"
                  disabled={!hasChanges || mutation.isPending}
                >
                  {mutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
