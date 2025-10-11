import { useEffect, useState } from "react";

import type { SellerUpgrade } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { SellerOnboardingDialog } from "./SellerOnboardingDialog";
import { SellerOnboardingSuccessDialog } from "./SellerOnboardingSuccessDialog";

type SellerUpgradeCardProps = {
  upgrade: SellerUpgrade;
  onCompleted: () => void;
};

export function SellerUpgradeCard({
  upgrade,
  onCompleted,
}: SellerUpgradeCardProps) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!upgrade.available) {
      setOpen(false);
    }
  }, [upgrade.available]);

  const handleClose = () => setOpen(false);

  const handleOnboardingComplete = () => {
    setOpen(false);
    setShowSuccess(true);
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onCompleted();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Card className="border-primary/40">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base font-semibold">
              {upgrade.headline}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {upgrade.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {upgrade.available ? (
              <>
                <p>
                  Completa el onboarding para habilitar tu tienda y empezar a
                  vender. Puedes regresar a esta pagina cuando quieras retomar
                  el proceso.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTrigger asChild>
                    <Button type="button">{upgrade.action.label}</Button>
                  </DialogTrigger>
                  <p className="text-xs text-muted-foreground">
                    Requerimos algunos datos basicos antes de activar tu tienda.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Badge variant="outline" className="w-fit uppercase">
                  En revision
                </Badge>
                <p>{upgrade.description}</p>
                {upgrade.status && (
                  <p className="text-xs text-muted-foreground">
                    Estado de tu tienda:{" "}
                    <span className="font-medium capitalize text-foreground">
                      {upgrade.status}
                    </span>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {upgrade.available && (
          <SellerOnboardingDialog
            onCompleted={handleOnboardingComplete}
            onClose={handleClose}
          />
        )}
      </Dialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <SellerOnboardingSuccessDialog onContinue={handleSuccessContinue} />
      </Dialog>
    </>
  );
}
