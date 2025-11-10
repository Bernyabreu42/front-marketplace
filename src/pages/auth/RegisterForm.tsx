import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { registerUser } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/utils";

export function RegisterForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password.length < 8) {
      toast.error("La contrasena debe tener al menos 8 caracteres");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Las contrasenas no coinciden");
      return;
    }

    setSubmitting(true);
    try {
      const response = await registerUser({
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        displayName: `${form.firstName} ${form.lastName}`.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      toast.success(response.message ?? "Cuenta creada. Revisa tu correo para verificarla.");
      navigate("/auth/login", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-background p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground">Completa tus datos para empezar a usar CommerceHub</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id="firstName"
              placeholder="Maria"
              value={form.firstName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Apellido
            </label>
            <Input
              id="lastName"
              placeholder="Gomez"
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="register-email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="register-email"
            type="email"
            placeholder="m@example.com"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="register-password" className="text-sm font-medium">
            Contrasena
          </label>
          <Input
            id="register-password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="register-confirm" className="text-sm font-medium">
            Confirmar contrasena
          </label>
          <Input
            id="register-confirm"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            required
          />
        </div>

        <Button type="submit" className="w-full bg-black text-white hover:bg-black/90" disabled={submitting}>
          {submitting ? "Registrando..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ya tienes cuenta?{" "}
        <Link to="/auth/login" className="text-primary underline">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}


