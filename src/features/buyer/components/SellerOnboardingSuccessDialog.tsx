import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type SellerOnboardingSuccessDialogProps = {
  onContinue: () => void;
};

export function SellerOnboardingSuccessDialog({ onContinue }: SellerOnboardingSuccessDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>¡Felicidades!</DialogTitle>
        <DialogDescription>
          Tu tienda ha sido creada. Ya puedes empezar a configurarla y a subir tus productos.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onContinue}>Continuar al panel de vendedor</Button>
      </DialogFooter>
    </DialogContent>
  );
}
