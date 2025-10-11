import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/utils";
import { fetchUserById } from "@/features/users/api";
import { createShippingMethod } from "./api";
import { ShippingMethodForm } from "./shipping/ShippingMethodForm";
import type { CreateShippingMethodPayload } from "./types";

export function SellerShippingCreatePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id;

  const mutation = useMutation({
    mutationFn: (payload: CreateShippingMethodPayload) => createShippingMethod(payload),
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ["seller", "shipping-methods", storeId] });
      }
      toast.success("Metodo creado correctamente");
      navigate("/dashboard/seller/shipping", { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSubmit = (payload: CreateShippingMethodPayload) => {
    if (!storeId) {
      toast.error("Necesitas una tienda activa para crear metodos");
      return;
    }
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button type="button" variant="ghost" asChild>
          <Link to="/dashboard/seller/shipping">Regresar</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nuevo metodo de envio</h1>
          <p className="text-sm text-muted-foreground">
            Define tarifas y condiciones para ofrecerlo a tus clientes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Detalles del metodo</CardTitle>
        </CardHeader>
        <CardContent>
          {userProfileQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Validando tu tienda...</p>
          ) : !storeId ? (
            <p className="text-sm text-muted-foreground">
              No encontramos una tienda asociada a tu cuenta. Primero crea y activa tu tienda.
            </p>
          ) : (
            <ShippingMethodForm
              submitting={mutation.isPending}
              submitLabel="Crear metodo"
              onSubmit={handleSubmit}
              onCancel={() => navigate("/dashboard/seller/shipping")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
