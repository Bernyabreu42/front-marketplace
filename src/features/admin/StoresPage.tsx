import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/utils";
import { fetchAdminStores, updateStoreStatus } from "./api";
import type { AdminStoreSummary } from "./types";

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  active: "Activa",
  inactive: "Inactiva",
  banned: "Suspendida",
  deleted: "Eliminada",
};

export function AdminStoresPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "stores", page],
    queryFn: () => fetchAdminStores({ page, limit: 10 }),
  });

  const mutation = useMutation({
    mutationFn: ({ storeId, status }: { storeId: string; status: string }) =>
      updateStoreStatus(storeId, status),
    onSuccess: (_, variables) => {
      toast.success(`Estado actualizado a ${statusLabel[variables.status] ?? variables.status}`);
      refetch();
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const stores: AdminStoreSummary[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tiendas</h1>
        <p className="text-sm text-muted-foreground">
          Supervisa las tiendas registradas y aprueba las que esten listas para publicarse.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Listado de tiendas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Cargando tiendas...</p>
          ) : stores.length === 0 ? (
            <p className="text-muted-foreground">No se encontraron tiendas en los criterios seleccionados.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-[920px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Propietario</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Productos</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {stores.map((store) => {
                      const status = store.status ?? "pending";
                      const canApprove = isAdmin && status === "pending";
                      const canToggle = isAdmin && (status === "active" || status === "inactive");
                      return (
                        <tr key={store.id} className="transition-colors hover:bg-muted/40">
                          <td className="px-4 py-3 font-medium text-foreground">{store.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {store.owner.displayName ?? store.owner.email}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">{statusLabel[status] ?? status}</td>
                          <td className="px-4 py-3 text-muted-foreground">{store._count?.products ?? 0}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/dashboard/admin/stores/${store.id}`}>Ver</Link>
                              </Button>
                              {canApprove && (
                                <Button
                                  size="sm"
                                  onClick={() => mutation.mutate({ storeId: store.id, status: "active" })}
                                  disabled={mutation.isPending}
                                >
                                  Aprobar
                                </Button>
                              )}
                              {canToggle && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={mutation.isPending}
                                  onClick={() =>
                                    mutation.mutate({
                                      storeId: store.id,
                                      status: status === "active" ? "inactive" : "active",
                                    })
                                  }
                                >
                                  {mutation.isPending
                                    ? "Actualizando..."
                                    : status === "active"
                                    ? "Pausar"
                                    : "Reactivar"}
                                </Button>
                              )}
                            </div>
                          </td>
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

