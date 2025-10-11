import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resenas</h1>
        <p className="text-sm text-muted-foreground">
          Analiza y modera las resenas recibidas por los productos del marketplace.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Moderacion de resenas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Esta funcionalidad estara disponible en la siguiente iteracion.
        </CardContent>
      </Card>
    </div>
  );
}
