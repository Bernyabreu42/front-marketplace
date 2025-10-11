import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel de administracion</h1>
        <p className="text-sm text-muted-foreground">
          Supervisa los indicadores clave del marketplace desde un solo lugar.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Resumen general</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Aun no tenemos datos para mostrar. Vuelve pronto para ver metricas y actividad reciente.
        </CardContent>
      </Card>
    </div>
  );
}
