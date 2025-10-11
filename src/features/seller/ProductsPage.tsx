import type { ProductListItem } from "./types";
import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserById } from "@/features/users/api";
import { deleteProduct } from "./api";
import { useStoreProducts } from "./hooks";
import SearchProducts from "@/components/SearchProducts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  draft: "secondary",
  inactive: "outline",
};

export function SellerProductsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [page, setPage] = useState(1);

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id;
  const productsQuery = useStoreProducts(storeId, { page, limit: 10 });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      productsQuery.refetch();
    },
  });

  const products: ProductListItem[] = productsQuery.data?.data ?? [];
  const pagination = productsQuery.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Administra el catalogo disponible para tu tienda y mantelo siempre
            actualizado.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/seller/products/new">Crear producto</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Listado de productos
          </CardTitle>
          <SearchProducts
            RenderExtraItems={(product) => (
              <div className="flex items-center gap-2">
                <Button asChild size="icon">
                  <Link to={`/dashboard/seller/products/${product.id}/preview`}>
                    <Eye className="sh-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="icon">
                  <Link to={`/dashboard/seller/products/${product.id}/edit`}>
                    <Pencil className="sh-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {productsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">
              Cargando productos...
            </p>
          ) : !storeId ? (
            <p className="text-sm text-muted-foreground">
              Aun no registras una tienda. Crea tu tienda para poder publicar
              productos.
            </p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavia no has publicado productos. Usa el boton "Crear producto"
              para comenzar.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table className="w-full text-left text-sm">
                <TableHeader className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-4 py-3">Nombre</TableHead>
                    <TableHead className="px-4 py-3">Estado</TableHead>
                    <TableHead className="px-4 py-3">Precio</TableHead>
                    <TableHead className="px-4 py-3">Stock</TableHead>
                    <TableHead className="px-4 py-3">Categorias</TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border bg-card">
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/40">
                      <TableCell className="px-4 py-3 font-medium text-foreground">
                        {product.name}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant={statusVariant[product.status] ?? "outline"}
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {money.format(product.priceFinal)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {product.stock}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                        {product.categories.map((cat) => cat.name).join(", ") ||
                          "Sin categorias"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="icon">
                            <Link
                              to={`/dashboard/seller/products/${product.id}/preview`}
                            >
                              <Eye className="sh-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon">
                            <Link
                              to={`/dashboard/seller/products/${product.id}/edit`}
                            >
                              <Pencil className="sh-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteMutation.mutate(product.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                disabled={!pagination?.prev || productsQuery.isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination?.next || productsQuery.isFetching}
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
