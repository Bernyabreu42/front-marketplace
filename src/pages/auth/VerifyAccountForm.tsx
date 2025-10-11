import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { verifyAccountByToken } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/utils";

export function VerifyAccountForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<
    "idle" | "verifying" | "success" | "error" | "missing"
  >(token ? "verifying" : "missing");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("missing");
      setMessage(
        "No encontramos un token de verificación válido. Revisa el enlace enviado a tu correo."
      );
      return;
    }

    let cancelled = false;
    (async () => {
      setState("verifying");
      try {
        const response = await verifyAccountByToken(token);
        if (cancelled) return;
        const successMessage =
          response.message ?? "Cuenta verificada. Ya puedes iniciar sesión.";
        setState("success");
        setMessage(successMessage);
        toast.success(successMessage);
      } catch (error) {
        if (cancelled) return;
        const errorMessage = getApiErrorMessage(error);
        setState("error");
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const subtitles = useMemo(() => {
    switch (state) {
      case "verifying":
        return "Estamos validando tu token de verificación. Esto puede tardar unos segundos.";
      case "success":
        return message;
      case "error":
        return message || "No pudimos verificar tu cuenta. Intenta solicitar un nuevo enlace.";
      case "missing":
        return message || "Parece que el enlace es inválido o ha expirado.";
      default:
        return "Validaremos tu correo con el enlace que recibiste.";
    }
  }, [state, message]);

  return (
    <div className="rounded-2xl bg-background p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Verifica tu cuenta</h1>
        <p className="text-sm text-muted-foreground">{subtitles}</p>
      </div>

      <div className="mt-6 space-y-4 text-center">
        {state === "verifying" && (
          <p className="text-sm text-muted-foreground">Verificando...</p>
        )}
        {state === "success" && (
          <Button asChild className="w-full">
            <Link to="/auth/login">Ir a iniciar sesión</Link>
          </Button>
        )}
        {state === "error" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Si el enlace expiró, inicia sesión o registra tu cuenta nuevamente
              para solicitar un nuevo correo de verificación.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/auth/login">Ir al inicio de sesión</Link>
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <Link to="/auth/register">Crear cuenta</Link>
              </Button>
            </div>
          </div>
        )}
        {state === "missing" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>El enlace de verificación es inválido o no fue proporcionado.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/auth/login">Solicitar un nuevo enlace</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

