import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  helper?: string;
  trend?: {
    value: number | null;
    label: string;
  };
}

export function StatCard({ title, value, helper, trend }: StatCardProps) {
  const trendValue = trend?.value ?? null;
  const trendLabel =
    trendValue !== null ? `${trendValue > 0 ? "+" : ""}${trendValue.toFixed(1)}%` : "—";
  const trendColor = trendValue === null ? "text-muted-foreground" : trendValue >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {helper && <Badge variant="outline">{helper}</Badge>}
        </div>
        <CardDescription className="text-3xl font-semibold text-foreground">
          {value}
        </CardDescription>
      </CardHeader>
      {trend && (
        <CardContent className="text-sm">
          <span className={trendColor}>{trendLabel}</span>
          <span className="ml-2 text-muted-foreground">{trend.label}</span>
        </CardContent>
      )}
    </Card>
  );
}
