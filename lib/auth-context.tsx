"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authApi, isJwtValid, userFromJwt, type ApiUser } from "./api";

export const TOKEN_KEY = "sk_token";

type AuthCtx = {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: ApiUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);

    // No stored token — nothing to do
    if (!stored) {
      setLoading(false);
      return;
    }

    // Stored token is expired — clean up and move on
    if (!isJwtValid(stored)) {
      localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
      return;
    }

    // Immediately load basic user info from the JWT so the UI
    // doesn't flicker while the API call is in-flight.
    const jwtUser = userFromJwt(stored);
    if (jwtUser) {
      setToken(stored);
      setUser(jwtUser);
    }

    // Then try to enrich with full profile from the API.
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    if (!base) {
      // No API URL configured — JWT fallback is all we can do.
      setLoading(false);
      return;
    }

    authApi
      .me(stored)
      .then(({ user: fullUser }) => {
        setToken(stored);
        setUser(fullUser);
      })
      .catch(() => {
        // API unreachable or token rejected — if JWT was already
        // parsed above we keep that minimal user, otherwise clean up.
        if (!jwtUser) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((tok: string, u: ApiUser) => {
    localStorage.setItem(TOKEN_KEY, tok);
    setToken(tok);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    const current = token;
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    // Fire-and-forget; don't block on the response
    if (current) {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";
      if (base) authApi.logout(current).catch(() => {});
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
