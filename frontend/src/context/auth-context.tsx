import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../lib/auth-api';
import type { User } from '../lib/auth-api';

const TOKEN_STORAGE_KEY = 'flowsync.authToken';

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );

  const persistToken = useCallback((value: string | null) => {
    setToken(value);
    if (value) {
      localStorage.setItem(TOKEN_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const payload = await authApi.login({ email, password });
      persistToken(payload.token);
      return payload.user;
    },
    [persistToken],
  );

  const signup = useCallback(
    async (email: string, password: string, passwordConfirmation: string) => {
      const payload = await authApi.signup({
        email,
        password,
        passwordConfirmation,
      });
      persistToken(payload.token);
      return payload.user;
    },
    [persistToken],
  );

  const logout = useCallback(async () => {
    if (token) {
      await authApi.logout(token).catch(() => undefined);
    }
    persistToken(null);
  }, [token, persistToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ token, isAuthenticated: !!token, login, signup, logout }),
    [token, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
