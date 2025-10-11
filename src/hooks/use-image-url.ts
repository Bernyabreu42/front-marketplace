import { useCallback, useMemo } from "react";

export function useImageUrlResolver() {
  const apiBaseUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    return base.endsWith("/") ? base.slice(0, -1) : base;
  }, []);

  return useCallback(
    (path: string | null | undefined) => {
      if (!path) return "";
      if (/^https?:\/\//i.test(path)) {
        return path;
      }
      const normalized = path.startsWith("/") ? path : `/${path}`;
      return `${apiBaseUrl}${normalized}`;
    },
    [apiBaseUrl]
  );
}
