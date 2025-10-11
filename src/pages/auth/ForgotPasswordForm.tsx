import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { requestPasswordReset } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Ingresa tu correo para continuar");
      return;
    }

    setPending(true);
    try {
      const response = await requestPasswordReset({ email: email.trim() });
      toast.success(response.message ?? "Te enviamos un correo con instrucciones.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-2xl bg-background p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Recupera tu acceso</h1>
        <p className="text-sm text-muted-foreground">
          Escribe tu correo y te enviaremos instrucciones para restablecer la contrasena
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="forgot-email" className="text-sm font-medium">
            Correo asociado a tu cuenta
          </label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Enviando..." : "Enviar instrucciones"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Recordaste tu contrasena?{" "}
        <Link to="/auth/login" className="text-primary underline">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}


