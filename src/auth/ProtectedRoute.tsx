import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthContext";

export function ProtectedRoute({ allowRoles }: { allowRoles?: string[] }) {
  const { user, loading, refresh } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const sessionRefreshAttemptRef = useRef(false);
  const roleRefreshAttemptRef = useRef(false);

  useEffect(() => {
    if (!loading && !refreshing && !user) {
      if (!sessionRefreshAttemptRef.current) {
        sessionRefreshAttemptRef.current = true;
        setRefreshing(true);
        refresh()
          .catch(() => undefined)
          .finally(() => {
            setRefreshing(false);
          });
      }
      return;
    }

    if (user) {
      sessionRefreshAttemptRef.current = false;
    }
  }, [loading, refreshing, refresh, user]);

  useEffect(() => {
    if (
      !loading &&
      !refreshing &&
      user &&
      allowRoles &&
      !allowRoles.includes(user.role)
    ) {
      if (!roleRefreshAttemptRef.current) {
        roleRefreshAttemptRef.current = true;
        setRefreshing(true);
        refresh()
          .catch(() => undefined)
          .finally(() => {
            setRefreshing(false);
          });
      }
      return;
    }

    if (user && allowRoles && allowRoles.includes(user.role)) {
      roleRefreshAttemptRef.current = false;
    }
  }, [allowRoles, loading, refreshing, refresh, user]);

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
