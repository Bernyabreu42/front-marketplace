import { Navigate } from "react-router-dom";

import { useAuth, type Role } from "@/auth/AuthContext";

const DEFAULT_ROUTE: Record<Role, string> = {
  admin: "/dashboard/analytics",
  support: "/dashboard/analytics",
  seller: "/dashboard/seller",
  buyer: "/dashboard/buyer",
};

export function DashboardLanding() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Preparando tu panel...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const target = DEFAULT_ROUTE[user.role] ?? "/dashboard/analytics";
  return <Navigate to={target} replace />;
}
