import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/utils";
import { fetchShippingMethod, updateShippingMethod } from "./api";
import { ShippingMethodForm } from "./shipping/ShippingMethodForm";
import type {
  CreateShippingMethodPayload,
  UpdateShippingMethodPayload,
} from "./types";

export function SellerShippingEditPage() {
  const params = useParams<{ shippingId: string }>();
  const shippingId = params.shippingId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const shippingQuery = useQuery({
    queryKey: ["seller", "shipping-method"],
    queryFn: () => fetchShippingMethod(shippingId!),
    enabled: Boolean(shippingId),
  });

  const storeId = shippingQuery.data?.data.storeId;

  const mutation = useMutation({
    mutationFn: (payload: UpdateShippingMethodPayload) =>
      updateShippingMethod(shippingId!, payload),
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({
          queryKey: ["seller", "shipping-methods", storeId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["seller", "shipping-method", shippingId],
      });
      toast.success("Metodo actualizado correctamente");
      navigate("/dashboard/seller/shipping", { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSubmit = (payload: CreateShippingMethodPayload) => {
    if (!shippingId) {
      toast.error("Identificador de metodo no valido");
      return;
    }
    const updatePayload: UpdateShippingMethodPayload = {
      name: payload.name,
      cost: payload.cost,
      description: payload.description,
    };
    mutation.mutate(updatePayload);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button type="button" variant="ghost" asChild>
          <Link to="/dashboard/seller/shipping">Regresar</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar metodo de envio
          </h1>
          <p className="text-sm text-muted-foreground">
            Actualiza tarifas o condiciones sin afectar a otros metodos.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Detalles del metodo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shippingQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">
              Cargando informacion del metodo...
            </p>
          ) : shippingQuery.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(shippingQuery.error)}
            </p>
          ) : !shippingQuery.data?.data ? (
            <p className="text-sm text-muted-foreground">
              No encontramos el metodo solicitado. Verifica el enlace e
              intentalo de nuevo.
            </p>
          ) : (
            <ShippingMethodForm
              defaultValues={shippingQuery.data.data}
              submitting={mutation.isPending}
              submitLabel="Guardar cambios"
              onSubmit={handleSubmit}
              onCancel={() => navigate("/dashboard/seller/shipping")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
