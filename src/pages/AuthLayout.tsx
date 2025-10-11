import { Outlet } from "react-router-dom";

import { AuthHeader } from "@/pages/auth/AuthHeader";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <AuthHeader />
        <Outlet />
      </div>
    </div>
  );
}
