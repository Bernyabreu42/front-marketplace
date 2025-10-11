import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  next: boolean;
  prev: boolean;
};

type Props<T> = {
  data: T[];
  query: string;
  onQueryChange: (q: string) => void;

  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T) => string | number;

  // opcionales
  isLoading?: boolean;
  isLoadingMore?: boolean;
  pagination?: PaginationInfo;
  onLoadMore?: () => void;

  placeholder?: string;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  noDataMessage?: string;
  minQueryLength?: number;
  debounceMs?: number;

  onItemSelect?: (item: T) => void;
};

function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchSelector<T>({
  data,
  query,
  onQueryChange,
  renderItem,
  getItemKey,
  isLoading = false,
  isLoadingMore = false,
  pagination,
  onLoadMore,
  placeholder = "Buscar...",
  className,
  inputClassName,
  dropdownClassName,
  noDataMessage = "No se encontraron resultados",
  minQueryLength = 1,
  debounceMs = 350,
  onItemSelect,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(query);

  // debounce local
  const debouncedValue = useDebounce(inputValue, debounceMs);

  // refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEmittedRef = useRef<string>(query);
  const onQueryChangeRef = useRef(onQueryChange);

  // mantener onQueryChange estable sin meterlo en deps
  useEffect(() => {
    onQueryChangeRef.current = onQueryChange;
  }, [onQueryChange]);

  // sync prop -> estado SOLO si cambió (evita loop)
  useEffect(() => {
    if (query !== inputValue) setInputValue(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // emitir cambios SOLO cuando el debounce se asienta y sean distintos
  useEffect(() => {
    const v = debouncedValue ?? "";

    if (v.length === 0) {
      if (lastEmittedRef.current !== "") {
        onQueryChangeRef.current("");
        lastEmittedRef.current = "";
      }
      setIsOpen(false);
      return;
    }

    if (v !== lastEmittedRef.current && v !== query) {
      onQueryChangeRef.current(v);
      lastEmittedRef.current = v;
    }

    if (v.length >= minQueryLength) setIsOpen(true);
    // deps acotadas para evitar re-render loops
  }, [debouncedValue, minQueryLength, query]);

  // handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    if (v.length === 0) setIsOpen(false);
    else if (v.length >= minQueryLength) setIsOpen(true);
  };

  const handleFocus = () => {
    if (inputValue.length >= minQueryLength && data.length > 0) setIsOpen(true);
  };

  const clearSearch = () => {
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleItemClick = (item: T) => {
    onItemSelect?.(item);
    setIsOpen(false);
  };

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!onLoadMore || isLoadingMore) return;
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight + 100 && pagination?.next) {
        onLoadMore();
      }
    },
    [onLoadMore, isLoadingMore, pagination?.next]
  );

  // cerrar al click fuera
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(ev.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const shouldShowDropdown = isOpen && inputValue.length >= minQueryLength;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={cn("pl-9 pr-9", inputClassName)}
          autoComplete="off"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {isLoading && (
          <Loader2
            className={cn(
              "absolute top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground",
              inputValue ? "right-10" : "right-3"
            )}
          />
        )}
      </div>

      {shouldShowDropdown && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg",
            dropdownClassName
          )}
          onScroll={handleScroll}
        >
          {isLoading && data.length === 0 ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Buscando...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {noDataMessage}
            </div>
          ) : (
            <>
              {data.map((item, index) => (
                <div
                  key={getItemKey(item)}
                  onClick={() => handleItemClick(item)}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {renderItem(item, index)}
                </div>
              ))}

              {isLoadingMore && (
                <div className="flex items-center justify-center p-3 border-t">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-xs text-muted-foreground">
                    Cargando más...
                  </span>
                </div>
              )}

              {pagination && !pagination.next && data.length > 0 && (
                <div className="p-2 text-center text-xs text-muted-foreground border-t">
                  {pagination.total} resultado
                  {pagination.total !== 1 ? "s" : ""} en total
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
