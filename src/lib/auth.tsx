"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "./api";
import { invalidateCreatedYears, invalidateClosedYears } from "./hooks";
import type { CurrentUser } from "./types";

interface AuthState {
  user: CurrentUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  activate: (token: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api<CurrentUser>("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api<{ token: string; user: CurrentUser }>("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });
    setToken(res.token);
    setUser(res.user);
    router.push("/dashboard");
  };

  const activate = async (token: string, password: string) => {
    const res = await api<{ token: string; user: CurrentUser }>("/api/auth/activate", {
      method: "POST",
      body: { token, password },
    });
    setToken(res.token);
    setUser(res.user);
    router.push("/dashboard");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    invalidateCreatedYears();
    invalidateClosedYears();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, activate, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
