import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAdminProducts } from "./api";
import type { AdminProduct, AdminProductsResponse } from "./types";
import { Link } from "react-router-dom";

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useQuery<AdminProductsResponse>({
    queryKey: ["admin", "products", page],
    queryFn: () => fetchAdminProducts({ page, limit: 10 }),
  });

  const products: AdminProduct[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Productos del marketplace
        </h1>
        <p className="text-sm text-muted-foreground">
          Revisa el catalogo global publicado por los vendedores.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Listado de productos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground">
              No se encontraron productos registrados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-[780px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {money.format(product.priceFinal)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {product.stock}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {product.status}
                        </td>
                        <td className="px-4 py-3">
                          <Button asChild variant="ghost" size="icon">
                            <Link
                              to={`/dashboard/admin/products/${product.id}/preview`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between  border-border pt-4 text-xs text-muted-foreground">
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
