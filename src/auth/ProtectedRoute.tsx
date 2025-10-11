import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthContext";

export function ProtectedRoute({ allowRoles }: { allowRoles?: string[] }) {
  const { user, loading, refresh } = useAuth();
  const hasAttemptedRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user && !hasAttemptedRef.current) {
      hasAttemptedRef.current = true;
      setRefreshing(true);
      refresh().finally(() => {
        setRefreshing(false);
      });
    }
  }, [loading, refresh, user]);

  if (loading || refreshing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
