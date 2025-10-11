import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/api/client";

export type Role = "admin" | "seller" | "buyer" | "support";

export type SellerUpgrade =
  | {
      available: true;
      headline: string;
      description: string;
      action: {
        label: string;
        href: string;
      };
    }
  | {
      available: false;
      headline: string;
      description: string;
      reason?: string;
      status?: string | null;
    };

export interface AuthStoreSummary {
  id: string;
  name: string | null;
  status?: string | null;
  ownerId?: string;
}

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  username?: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  status?: string;
  emailVerified?: boolean;
  isOnline?: boolean;
  lastLogin?: string | null;
  lastSeenAt?: string | null;
  profileImage?: string | null;
  store?: AuthStoreSummary | null;
  sellerUpgrade?: SellerUpgrade | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchCurrentUser({ withRefresh = true }: { withRefresh?: boolean } = {}): Promise<AuthUser | null> {
  try {
    const response = await apiFetch<{ data?: AuthUser }>("/api/auth/me");
    return response.data ?? null;
  } catch {
    if (!withRefresh) {
      return null;
    }

    try {
      await apiFetch("/api/auth/refresh-token");
      const response = await apiFetch<{ data?: AuthUser }>("/api/auth/me");
      return response.data ?? null;
    } catch {
      return null;
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      const current = await fetchCurrentUser({ withRefresh: false });
      setUser(current);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "GET" }).catch(
      () => undefined
    );
    setUser(null);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const current = await fetchCurrentUser();
      setUser(current);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
