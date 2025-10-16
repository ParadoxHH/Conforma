'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { apiClient, setAuthToken } from '@/lib/api-client';

type AuthUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'CONTRACTOR' | 'HOMEOWNER';
  createdAt: string;
  updatedAt?: string;
};

type StoredAuthState = {
  token: string;
  user: AuthUser;
};

type LoginPayload = {
  email: string;
  password: string;
};

type CreateAccountPayload = {
  email: string;
  password: string;
  role: 'homeowner' | 'contractor';
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  createAccount: (payload: CreateAccountPayload) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = 'conforma.auth.state';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const persistState = useCallback((state: StoredAuthState | null) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (state) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const applyAuthState = useCallback(
    (state: StoredAuthState | null) => {
      if (state) {
        setAuthToken(state.token);
        setUser(state.user);
        persistState(state);
      } else {
        setAuthToken(null);
        setUser(null);
        persistState(null);
      }
    },
    [persistState],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let isMounted = true;

    const restore = async () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored) as StoredAuthState;
        if (!parsed?.token) {
          return;
        }

        if (isMounted) {
          applyAuthState(parsed);
        }

        try {
          const profile = await apiClient.get<AuthUser>('/auth/me');
          if (isMounted) {
            applyAuthState({ token: parsed.token, user: profile });
          }
        } catch (error) {
          if (isMounted) {
            applyAuthState(null);
          }
        }
      } catch (error) {
        if (isMounted) {
          applyAuthState(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restore();

    return () => {
      isMounted = false;
    };
  }, [applyAuthState]);

  const login = useCallback(
    async ({ email, password }: LoginPayload) => {
      const sanitizedEmail = email.trim().toLowerCase();
      if (!sanitizedEmail) {
        throw new Error('A valid email address is required to sign in.');
      }
      if (!password) {
        throw new Error('Please enter your password.');
      }

      const { user: nextUser, token } = await apiClient.post<{ user: AuthUser; token: string }>(
        '/auth/login',
        { email: sanitizedEmail, password },
        { skipAuth: true },
      );

      applyAuthState({ token, user: nextUser });
    },
    [applyAuthState],
  );

  const createAccount = useCallback(
    async ({ email, password, role }: CreateAccountPayload) => {
      const sanitizedEmail = email.trim().toLowerCase();

      if (!sanitizedEmail) {
        throw new Error('A valid email address is required to continue.');
      }
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }

      const normalizedRole = role === 'contractor' ? 'CONTRACTOR' : 'HOMEOWNER';

      await apiClient.post(
        '/auth/register',
        { email: sanitizedEmail, password, role: normalizedRole },
        { skipAuth: true },
      );

      await login({ email: sanitizedEmail, password });
    },
    [login],
  );

  const logout = useCallback(() => {
    applyAuthState(null);
  }, [applyAuthState]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      createAccount,
      logout,
    }),
    [user, loading, login, createAccount, logout],
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
