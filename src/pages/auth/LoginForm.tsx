import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/utils";

const GOOGLE_AUTH_PATH = "/api/auth/google";

export function LoginForm() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      toast.success("Sesion iniciada correctamente");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
      window.location.href = new URL(GOOGLE_AUTH_PATH, base).toString();
    } catch (error) {
      toast.error("No podemos abrir Google en este momento");
    }
  };

  return (
    <div className="rounded-2xl bg-background p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Inicia sesion</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu correo electronico para iniciar sesion
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <Link to="/auth/forgot" className="text-primary underline">
              Olvidaste tu contrasena?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-black/90"
          disabled={loading || submitting}
        >
          {loading || submitting ? "Entrando..." : "Login"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="flex-1 border-t border-border" />
        <span>O continua con</span>
        <span className="flex-1 border-t border-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
      >
        <span className="mr-2 text-xl">G</span>
        Login with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No tienes cuenta?{" "}
        <Link to="/auth/register" className="text-primary underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
