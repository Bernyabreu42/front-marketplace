import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/utils";
import { createCategory } from "./api";

export function AdminCategoryCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", slug: "" });

  const mutation = useMutation({
    mutationFn: () =>
      createCategory({ name: form.name.trim(), slug: form.slug.trim() }),
    onSuccess: () => {
      toast.success("Categoria creada correctamente");
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

    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nueva categoria
        </h1>
        <p className="text-sm text-muted-foreground">
          Define una nueva categoria para organizar los productos del
          marketplace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Datos de la categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="category-name"
              >
                Nombre
              </label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="category-slug"
              >
                Slug
              </label>
              <Input
                id="category-slug"
                value={form.slug}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, slug: event.target.value }))
                }
                placeholder="ej. tecnologia"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard/admin/categories">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Crear categoria"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
