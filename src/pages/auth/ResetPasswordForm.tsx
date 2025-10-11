import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { resetPassword } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/utils";

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [form, setForm] = useState({
    token: tokenFromUrl,
    password: "",
    confirmPassword: "",
  });
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.token.trim()) {
      toast.error("Ingresa el token o codigo de restablecimiento");
      return;
    }

    if (form.password.length < 8) {
      toast.error("La nueva contrasena debe tener al menos 8 caracteres");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Las contrasenas no coinciden");
      return;
    }

    setPending(true);
    try {
      const response = await resetPassword({
        token: form.token.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success(
        response.message ??
          "Contrasena actualizada. Ahora puedes iniciar sesion."
      );
      navigate("/auth/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-2xl bg-background p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Restablece tu contrasena</h1>
        <p className="text-sm text-muted-foreground">
          Introduce el token recibido y define una nueva contrasena
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2 hidden">
          <label htmlFor="reset-token" className="text-sm font-medium">
            Token o codigo
          </label>
          <Input
            hidden
            id="reset-token"
            value={form.token}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, token: event.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="reset-password" className="text-sm font-medium">
            Nueva contrasena
          </label>
          <Input
            id="reset-password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="reset-confirm" className="text-sm font-medium">
            Confirmar contrasena
          </label>
          <Input
            id="reset-confirm"
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Guardando..." : "Restablecer contrasena"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ya tienes acceso?{" "}
        <Link to="/auth/login" className="text-primary underline">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
