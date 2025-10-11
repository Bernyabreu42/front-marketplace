import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Acceso restringido</h1>
        <p className="text-muted-foreground">
          No tienes permisos para visualizar este panel. Contacta a un
          administrador si crees que es un error.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  );
}
