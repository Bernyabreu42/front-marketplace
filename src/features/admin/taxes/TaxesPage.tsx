import { useMemo, useState, type ChangeEvent } from "react";

import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAdminStore, fetchAdminTaxes } from "@/features/admin/api";
import type {
  AdminStoreDetail,
  AdminTax,
  AdminTaxesResponse,
} from "@/features/admin/types";

const typeLabel: Record<AdminTax["type"], string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
};

const statusLabel: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  deleted: "Eliminado",
};

const statusBadgeClass: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-amber-100 text-amber-700",
  deleted: "bg-slate-200 text-slate-600",
};

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

const formatRate = (tax: AdminTax) =>
  tax.type === "percentage" ? `${tax.rate}%` : money.format(tax.rate);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

interface FiltersState {
  status: string;
  type: string;
  storeId: string;
}

export function AdminTaxesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    status: "all",
    type: "all",
    storeId: "",
  });

  const storeFilter = filters.storeId.trim();

  const queryKey = useMemo(
    () => ["admin", "taxes", page, filters.status, filters.type, storeFilter],
    [page, filters.status, filters.type, storeFilter]
  );

  const query = useQuery<AdminTaxesResponse>({
    queryKey,
    queryFn: () =>
      fetchAdminTaxes({
        page,
        limit: 20,
        status: filters.status !== "all" ? filters.status : undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        storeId: storeFilter || undefined,
      }),
  });

  const taxes: AdminTax[] = query.data?.data ?? [];

  const uniqueStoreIds = useMemo(() => {
    const ids = new Set<string>();
    taxes.forEach((tax) => {
      if (tax.storeId) {
        ids.add(tax.storeId);
      }
    });
    return Array.from(ids);
  }, [taxes]);

  const storeQueries = useQueries({
    queries: uniqueStoreIds.map((id) => ({
      queryKey: ["admin", "store-summary", id],
      queryFn: () => fetchAdminStore(id),
      enabled: Boolean(id),
      staleTime: 60_000,
    })),
  });

  const storeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    storeQueries.forEach((result, index) => {
      const storeInfo = result.data?.data as AdminStoreDetail | undefined;
      if (storeInfo?.name) {
        map.set(uniqueStoreIds[index], storeInfo.name);
      }
    });
    return map;
  }, [storeQueries, uniqueStoreIds]);

  const storeFilterLower = storeFilter.toLowerCase();

  const filteredTaxes = useMemo(() => {
    return taxes.filter((tax) => {
      if (filters.status !== "all" && tax.status !== filters.status) {
        return false;
      }
      if (filters.type !== "all" && tax.type !== filters.type) {
        return false;
      }
      if (storeFilterLower) {
        const nameMatch = storeNameMap
          .get(tax.storeId)
          ?.toLowerCase()
          .includes(storeFilterLower);
        const idMatch = tax.storeId.toLowerCase().includes(storeFilterLower);
        if (!nameMatch && !idMatch) {
          return false;
        }
      }
      return true;
    });
  }, [taxes, filters.status, filters.type, storeFilterLower, storeNameMap]);

  const pagination = query.data?.pagination;

  const handleFilterChange =
    (name: keyof FiltersState) =>
    (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      const value = event.target.value;
      setFilters((prev) => ({ ...prev, [name]: value }));
      setPage(1);
    };

  const hasFiltersApplied =
    filters.status !== "all" || filters.type !== "all" || Boolean(storeFilter);

  const clearFilters = () => {
    if (!hasFiltersApplied) return;
    setFilters({ status: "all", type: "all", storeId: "" });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Impuestos</h1>
          <p className="text-sm text-muted-foreground">
            Consulta y audita los impuestos declarados por las tiendas del
            marketplace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Activo
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Inactivo
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> Eliminado
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Listado global
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 md:grid-cols-[repeat(3,minmax(0,180px))] lg:grid-cols-[repeat(4,minmax(0,180px))]">
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="status-filter"
              >
                Estado
              </label>
              <select
                id="status-filter"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                value={filters.status}
                onChange={handleFilterChange("status")}
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
                htmlFor="type-filter"
              >
                Tipo
              </label>
              <select
                id="type-filter"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                value={filters.type}
                onChange={handleFilterChange("type")}
              >
                <option value="all">Todos</option>
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-1 lg:col-span-2">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="store-filter"
              >
                Buscar tienda (nombre o ID)
              </label>
              <Input
                id="store-filter"
                value={filters.storeId}
                onChange={handleFilterChange("storeId")}
                placeholder="Nombre o UUID de la tienda"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={query.isFetching || !hasFiltersApplied}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          {query.isLoading ? (
            <p className="text-muted-foreground">Cargando impuestos...</p>
          ) : filteredTaxes.length === 0 ? (
            <p className="text-muted-foreground">
              No se encontraron impuestos con los criterios seleccionados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[62vh] overflow-auto">
                <table className="min-w-[900px] w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Tienda</th>
                      <th className="px-4 py-3">Actualizado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card/90">
                    {filteredTaxes.map((tax) => {
                      const storeName = storeNameMap.get(tax.storeId);
                      return (
                        <tr
                          key={tax.id}
                          className="transition-colors hover:bg-muted/40"
                        >
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
                            <Badge
                              className={
                                statusBadgeClass[tax.status] ??
                                "bg-slate-200 text-slate-600"
                              }
                            >
                              {statusLabel[tax.status] ?? tax.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <Link
                              to={`/dashboard/admin/stores/${tax.storeId}`}
                              className="text-sm font-medium text-primary hover:underline"
                              title={tax.storeId}
                            >
                              {storeName ?? tax.storeId}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(tax.updatedAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/dashboard/admin/taxes/${tax.id}`}>
                                Ver detalle
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                disabled={!pagination?.prev || query.isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination?.next || query.isFetching}
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
