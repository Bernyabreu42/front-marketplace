import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAdminUsers } from "./api";
import type { AdminUser, AdminUsersResponse } from "./types";
import clsx from "clsx";

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data, isLoading, isFetching } = useQuery<AdminUsersResponse>({
    queryKey: ["admin", "users", page],
    queryFn: () => fetchAdminUsers({ page, limit: 20 }),
  });

  const users: AdminUser[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Supervisar el estado de las cuentas registradas en CommerceHub.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Listado de usuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">
              No se encontraron usuarios en los criterios seleccionados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-[840px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Correo</th>
                      <th className="px-4 py-3">Rol</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Verificado</th>
                      {/* <th className="px-4 py-3">Ultimo acceso</th> */}
                      <th className="px-4 py-3">En linea</th>
                      {isAdmin && (
                        <th className="px-4 py-3 text-right">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {users.map((user) => {
                      const fallbackName = [user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(" ");
                      const displayName =
                        user.displayName || fallbackName || "Sin nombre";
                      return (
                        <tr
                          key={user.id}
                          className="transition-colors hover:bg-muted/40"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {displayName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">
                            {user.role}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">
                            {user.status}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {user.emailVerified ? "Si" : "No"}
                          </td>
                          {/* <td className="px-4 py-3 text-muted-foreground text-xs">
                            {user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleString("es-DO") : "-"}
                          </td> */}
                          <td className="px-4 py-3 text-muted-foreground text-xs flex items-center gap-2">
                            <div
                              className={clsx(
                                "flex w-4 h-4 rounded-full items-center justify-center",
                                user.isOnline &&
                                  "animate-pulse bg-green-500/20",
                                !user.isOnline && "animate-pulse bg-red-500/20"
                              )}
                            >
                              <span
                                className={clsx(
                                  "flex w-2 h-2  rounded-full items-center justify-center",
                                  user.isOnline && "bg-green-500",
                                  !user.isOnline && "bg-red-500"
                                )}
                              ></span>
                            </div>
                            {user.isOnline ? "En línea" : "Fuera de línea"}
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3 text-right">
                              <Button asChild size="sm" variant="outline">
                                <Link to={`/dashboard/admin/users/${user.id}`}>
                                  Editar
                                </Link>
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <span>
              Pagina {pagination?.page ?? 1} de {pagination?.totalPages ?? 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination?.prev || isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination?.next || isFetching}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
