import { useMemo, useState, type ChangeEvent } from "react";

import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { TaxItem } from "./types";
import { deleteTax } from "./api";
import { useStoreTaxes } from "./hooks";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  deleted: "outline",
};

const typeLabel: Record<TaxItem["type"], string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
};

const formatRate = (tax: TaxItem) =>
  tax.type === "percentage" ? `${tax.rate}%` : `RD$ ${tax.rate.toFixed(2)}`;

interface FiltersState {
  status: string;
  type: string;
  query: string;
}

export function SellerTaxesPage() {
  const { user } = useAuth();
  const storeId = user?.store?.id;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    status: "all",
    type: "all",
    query: "",
  });

  const taxesQuery = useStoreTaxes(storeId, {
    page,
    limit: 20,
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
  });

  const deleteMutation = useMutation({
    mutationFn: (taxId: string) => deleteTax(taxId),
    onSuccess: () => taxesQuery.refetch(),
  });

  const taxes: TaxItem[] = taxesQuery.data?.data ?? [];
  const pagination = taxesQuery.data?.pagination;

  const searchTerm = filters.query.trim().toLowerCase();

  const filteredTaxes = useMemo(() => {
    return taxes.filter((tax) => {
      if (filters.status !== "all" && tax.status !== filters.status) {
        return false;
      }
      if (filters.type !== "all" && tax.type !== filters.type) {
        return false;
      }
      if (searchTerm) {
        const inName = tax.name.toLowerCase().includes(searchTerm);
        const inDescription = tax.description
          ?.toLowerCase()
          .includes(searchTerm);
        if (!inName && !inDescription) {
          return false;
        }
      }
      return true;
    });
  }, [taxes, filters.status, filters.type, searchTerm]);

  const handleFilterChange =
    (name: keyof FiltersState) =>
    (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      const value = event.target.value;
      setFilters((prev) => ({ ...prev, [name]: value }));
      setPage(1);
    };

  const hasFiltersApplied =
    filters.status !== "all" || filters.type !== "all" || Boolean(searchTerm);

  const clearFilters = () => {
    if (!hasFiltersApplied) return;
    setFilters({ status: "all", type: "all", query: "" });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Impuestos</h1>
          <p className="text-sm text-muted-foreground">
            Configura los impuestos que se aplican a tus productos y mantenlos
            actualizados.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/seller/taxes/new">Registrar impuesto</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Impuestos configurados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 md:grid-cols-[repeat(3,minmax(0,180px))] lg:grid-cols-[repeat(4,minmax(0,180px))]">
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="seller-tax-status-filter"
              >
                Estado
              </label>
              <select
                id="seller-tax-status-filter"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                value={filters.status}
                onChange={handleFilterChange("status")}
                disabled={taxesQuery.isLoading}
              >
                <option value="all">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="deleted">Eliminado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="seller-tax-type-filter"
              >
                Tipo
              </label>
              <select
                id="seller-tax-type-filter"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                value={filters.type}
                onChange={handleFilterChange("type")}
                disabled={taxesQuery.isLoading}
              >
                <option value="all">Todos</option>
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2 lg:col-span-2">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="seller-tax-query-filter"
              >
                Buscar por nombre o descripción
              </label>
              <Input
                id="seller-tax-query-filter"
                value={filters.query}
                onChange={handleFilterChange("query")}
                placeholder="Ejemplo: ITBIS"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={taxesQuery.isFetching || !hasFiltersApplied}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          {taxesQuery.isLoading ? (
            <p className="text-muted-foreground">Cargando impuestos...</p>
          ) : !storeId ? (
            <p className="text-muted-foreground">
              Necesitas una tienda activa para configurar impuestos.
            </p>
          ) : filteredTaxes.length === 0 ? (
            <p className="text-muted-foreground">
              No se encontraron impuestos con los filtros seleccionados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Tasa</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredTaxes.map((tax) => (
                    <tr key={tax.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {tax.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {typeLabel[tax.type] ?? tax.type}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatRate(tax)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[tax.status] ?? "outline"}>
                          {tax.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/dashboard/seller/taxes/${tax.id}/edit`}>
                              Editar
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(tax.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <span>
              Pagina {pagination?.page ?? 1} de {pagination?.totalPages ?? 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination?.prev || taxesQuery.isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination?.next || taxesQuery.isFetching}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
