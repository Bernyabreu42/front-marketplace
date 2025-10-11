import { useState, useEffect } from "react";

/**
 * Devuelve el valor sólo después de que el usuario dejó de cambiarlo
 * por el tiempo indicado en delay.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
