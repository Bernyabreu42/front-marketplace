import { useEffect, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/utils";
import { fetchAdminCategory, updateCategory } from "./api";

export function AdminCategoryEditPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", slug: "" });

  const categoryQuery = useQuery({
    queryKey: ["admin", "categories", categoryId],
    queryFn: () => fetchAdminCategory(categoryId!),
    enabled: Boolean(categoryId),
  });

  useEffect(() => {
    const category = categoryQuery.data?.data;
    if (category) {
      setForm({ name: category.name ?? "", slug: category.slug ?? "" });
    }
  }, [categoryQuery.data]);

  const mutation = useMutation({
    mutationFn: () =>
      updateCategory(categoryId!, { name: form.name.trim(), slug: form.slug.trim() }),
    onSuccess: () => {
      toast.success("Categoria actualizada");
      navigate("/dashboard/admin/categories", { replace: true });
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Completa el nombre y el slug de la categoria.");
      return;
    }

    if (!categoryId) {
      toast.error("Categoria no valida.");
      return;
    }

    mutation.mutate();
  };

  const isLoading = categoryQuery.isLoading || mutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Editar categoria</h1>
          <p className="text-sm text-muted-foreground">
            Actualiza los metadatos de la categoria seleccionada.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/dashboard/admin/categories">Cancelar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Datos de la categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Cargando categoria...</p>
          )}
          {!categoryQuery.isLoading && !categoryQuery.data?.data && (
            <p className="text-sm text-muted-foreground">
              No pudimos cargar la categoria solicitada.
            </p>
          )}
          {categoryQuery.data?.data && (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-muted-foreground" htmlFor="category-name">
                  Nombre
                </label>
                <Input
                  id="category-name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground" htmlFor="category-slug">
                  Slug
                </label>
                <Input
                  id="category-slug"
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                  placeholder="ej. tecnologia"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
