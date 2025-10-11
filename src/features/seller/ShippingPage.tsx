import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/utils";
import { fetchUserById } from "@/features/users/api";
import { deleteShippingMethod } from "./api";
import { useStoreShippingMethods } from "./hooks";
import type { ShippingMethod } from "./types";

const currency = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  minimumFractionDigits: 2,
});

export function SellerShippingPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id;
  const shippingQuery = useStoreShippingMethods(storeId);

  const deleteMutation = useMutation({
    mutationFn: (shippingId: string) => deleteShippingMethod(shippingId),
    onSuccess: () => {
      toast.success("Metodo eliminado correctamente");
      shippingQuery.refetch();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const shippingMethods: ShippingMethod[] = shippingQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Metodos de envio
          </h1>
          <p className="text-sm text-muted-foreground">
            Define opciones de entrega y costos disponibles para tus clientes.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/seller/shipping/new">Crear metodo</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Metodos configurados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {userProfileQuery.isLoading ? (
            <p className="text-muted-foreground">Validando tu tienda...</p>
          ) : !storeId ? (
            <p className="text-muted-foreground">
              Necesitas una tienda activa para gestionar metodos de envio.
            </p>
          ) : shippingQuery.isLoading ? (
            <p className="text-muted-foreground">
              Cargando metodos de envio...
            </p>
          ) : shippingQuery.isError ? (
            <p className="text-destructive">
              Hubo un problema al obtener los metodos:{" "}
              {getApiErrorMessage(shippingQuery.error)}
            </p>
          ) : shippingMethods.length === 0 ? (
            <p className="text-muted-foreground">
              Todavia no has configurado metodos de envio. Usa el boton "Crear
              metodo" para comenzar.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table className="w-full text-left text-sm">
                <TableHeader className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-4 py-3">Nombre</TableHead>
                    <TableHead className="px-4 py-3">Precio</TableHead>
                    <TableHead className="px-4 py-3">Descripcion</TableHead>
                    <TableHead className="px-4 py-3">Creado</TableHead>
                    <TableHead className="px-4 py-3 text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border bg-card">
                  {shippingMethods.map((method) => (
                    <TableRow key={method.id} className="hover:bg-muted/40">
                      <TableCell className="px-4 py-3 font-medium text-foreground">
                        {method.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {currency.format(method.cost)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {method.description ? (
                          <span>{method.description}</span>
                        ) : (
                          <Badge variant="outline">Sin descripcion</Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {new Date(method.createdAt).toLocaleDateString("es-DO")}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link
                              to={`/dashboard/seller/shipping/${method.id}/edit`}
                            >
                              Editar
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Seguro que deseas eliminar este metodo?"
                                )
                              ) {
                                deleteMutation.mutate(method.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
