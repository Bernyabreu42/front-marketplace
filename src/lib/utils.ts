import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiErrorMessage(error: unknown): string {
  let errorMessage = "Ocurrió un error inesperado";
  if (error instanceof Error) {
    try {
      const apiError = JSON.parse(error.message);
      errorMessage = apiError.message ?? errorMessage;
    } catch (e) {
      // If parsing fails, it might be a plain text message.
      errorMessage = error.message;
    }
  }
  return errorMessage;
}
