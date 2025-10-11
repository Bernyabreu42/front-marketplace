import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import "sonner/dist/styles.css";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "@/auth/AuthContext";
import { AccessibilityWidget } from "@/components/accessibility/AccessibilityWidget";
import "./index.css";
import { router } from "./App";
import { queryClient } from "./query/client";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <AccessibilityWidget />
        <Toaster position="top-right" richColors theme="light" />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  </StrictMode>
);


