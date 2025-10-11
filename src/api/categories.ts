import type { CategoryType } from "@/types";
import { apiFetch } from "./client";

export const getCategories = () =>
  apiFetch<CategoryType[]>("/api/categories", {
    method: "GET",
  });
