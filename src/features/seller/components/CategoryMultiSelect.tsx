import { useCallback, useMemo, useState } from "react";
import { X } from "lucide-react";

import type { CategorySummary } from "../types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface CategoryMultiSelectProps {
  available: CategorySummary[];
  selected: Array<{ id: string; name: string }>;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function CategoryMultiSelect({
  available,
  selected,
  onAdd,
  onRemove,
  disabled,
  loading,
}: CategoryMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.id)),
    [selected]
  );

  const filteredOptions = useMemo(() => {
    if (loading) return [] as CategorySummary[];

    const term = query.trim().toLowerCase();
    const base = available.filter((category) => !selectedIds.has(category.id));
    if (!term) return base.slice(0, 8);
    return base
      .filter((category) => category.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [available, loading, query, selectedIds]);

  const handleOptionClick = useCallback(
    (categoryId: string) => {
      onAdd(categoryId);
      setQuery("");
    },
    [onAdd]
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] rounded-md border border-dashed border-muted-foreground/20 bg-muted/40 px-3 py-2">
        {selected.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            Aun no has seleccionado categorias.
          </span>
        ) : (
          selected.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <span>{category.name}</span>
              <button
                type="button"
                onClick={() => onRemove(category.id)}
                className="rounded-full p-0.5 hover:bg-black/10"
                aria-label={`Quitar ${category.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <div className="relative">
        <Input
          value={query}
          disabled={disabled}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 120)}
          placeholder="Buscar y agregar categorias"
        />

        {isOpen && !disabled && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow">
            {loading ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Cargando categorias...
              </p>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleOptionClick(category.id)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span>{category.name}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                {query
                  ? "No encontramos categorias para ese termino"
                  : "Ya anadiste todas las categorias disponibles"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

