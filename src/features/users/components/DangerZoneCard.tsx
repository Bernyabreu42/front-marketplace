import { useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type DangerZoneCardProps = {
  email: string;
  isDeleting: boolean;
  onDelete: () => void;
  error?: string | null;
};

export function DangerZoneCard({ email, isDeleting, onDelete, error }: DangerZoneCardProps) {
  const [confirmation, setConfirmation] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const inputId = useId();

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canProceed =
    confirmation.trim().toLowerCase() === normalizedEmail && normalizedEmail.length > 0;

  useEffect(() => {
    setConfirmation("");
    setLocalError(null);
  }, [normalizedEmail]);

  const handleDeleteClick = () => {
    if (!canProceed) {
      setLocalError("Confirma tu correo para continuar.");
      return;
    }
    setLocalError(null);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    onDelete();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return;
    setOpen(nextOpen);
  };

  const message = error ?? localError;

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-destructive">Zona de riesgo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Eliminar tu cuenta es una accion permanente. Se cerraran todas tus sesiones y perderas acceso a tus ordenes y beneficios.
        </p>
        <div className="space-y-2">
          <label htmlFor={inputId} className="text-sm font-medium text-muted-foreground">
            Escribe tu correo para confirmar
          </label>
          <Input
            id={inputId}
            placeholder={email}
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              if (localError) {
                setLocalError(null);
              }
            }}
            disabled={isDeleting}
          />
        </div>
        {message && <p className="text-sm text-destructive">{message}</p>}
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar cuenta"}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Estas seguro?</DialogTitle>
              <DialogDescription>
                Esta accion es irreversible. Se eliminara permanentemente tu cuenta y los datos asociados.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Esta operacion cerrara todas tus sesiones activas y perderas acceso inmediato a la plataforma.
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isDeleting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
