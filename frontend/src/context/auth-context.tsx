import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  API_BASE_URL,
  ApiError,
  parseResponse,
  publicRequest,
  withJsonHeaders,
} from "@/services/api";
import {
  clearSession,
  loadSession,
  saveSession,
} from "@/services/session-storage";
import type { ApiUser, AuthTokens } from "@/types/api";

type RegisterPayload = {
  nombre: string;
  correo: string;
  password: string;
};

type AuthContextValue = {
  user: ApiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokensRef = useRef<AuthTokens | null>(null);
  const refreshPromiseRef = useRef<Promise<AuthTokens> | null>(null);

  const persistTokens = useCallback(async (tokens: AuthTokens | null) => {
    tokensRef.current = tokens;

    if (tokens) {
      await saveSession(tokens);
    } else {
      await clearSession();
    }
  }, []);

  const refreshTokens = useCallback(async (): Promise<AuthTokens> => {
    const currentTokens = tokensRef.current;

    if (!currentTokens) {
      throw new ApiError("La sesión ha expirado.", 401);
    }

    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = publicRequest<AuthTokens>("/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refresh_token: currentTokens.refresh_token,
        }),
      })
        .then(async (tokens) => {
          await persistTokens(tokens);
          return tokens;
        })
        .finally(() => {
          refreshPromiseRef.current = null;
        });
    }

    return refreshPromiseRef.current;
  }, [persistTokens]);

  const request = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      const execute = async (accessToken: string): Promise<Response> => {
        return fetch(`${API_BASE_URL}${path}`, {
          ...init,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...init.headers,
          },
        });
      };

      const currentTokens = tokensRef.current;

      if (!currentTokens) {
        throw new ApiError("Debes iniciar sesión.", 401);
      }

      let response = await execute(currentTokens.access_token);

      if (response.status === 401) {
        try {
          const refreshedTokens = await refreshTokens();
          response = await execute(refreshedTokens.access_token);
        } catch (error) {
          await persistTokens(null);
          setUser(null);
          throw error;
        }
      }

      return parseResponse<T>(response);
    },
    [persistTokens, refreshTokens]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const body = new URLSearchParams({
        username: email.trim().toLowerCase(),
        password,
      }).toString();

      const tokens = await publicRequest<AuthTokens>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      await persistTokens(tokens);

      try {
        setUser(await request<ApiUser>("/auth/me"));
      } catch (error) {
        await persistTokens(null);
        throw error;
      }
    },
    [persistTokens, request]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await publicRequest<ApiUser>(
        "/auth/register",
        withJsonHeaders({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );

      await login(payload.correo, payload.password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    const refreshToken = tokensRef.current?.refresh_token;

    if (refreshToken) {
      try {
        await publicRequest("/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // La sesión local siempre se elimina aunque el servidor no responda.
      }
    }

    await persistTokens(null);
    setUser(null);
  }, [persistTokens]);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const storedTokens = await loadSession();

        if (!storedTokens) {
          return;
        }

        tokensRef.current = storedTokens;
        const restoredUser = await request<ApiUser>("/auth/me");

        if (active) {
          setUser(restoredUser);
        }
      } catch {
        await persistTokens(null);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void restore();

    return () => {
      active = false;
    };
  }, [persistTokens, request]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user && tokensRef.current),
      login,
      register,
      logout,
      request,
    }),
    [isLoading, login, logout, register, request, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
