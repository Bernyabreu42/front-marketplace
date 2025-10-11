import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAdminCategories } from "./api";
import type { AdminCategoriesResponse, AdminCategory } from "./types";

export function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useQuery<AdminCategoriesResponse>({
    queryKey: ["admin", "categories", page],
    queryFn: () => fetchAdminCategories({ page, limit: 20 }),
  });

  const categories: AdminCategory[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Crea y organiza las categorias disponibles en el marketplace.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/admin/categories/new">Nueva categoria</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Listado de categorias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Cargando categorias...</p>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground">No hay categorias registradas.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-[560px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {categories.map((category) => (
                      <tr key={category.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium text-foreground">{category.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/dashboard/admin/categories/${category.id}/edit`}>Editar</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
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
