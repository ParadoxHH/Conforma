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

type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: 'homeowner' | 'contractor';
  createdAt: string;
};

type LoginPayload = {
  email: string;
  name?: string;
};

type CreateAccountPayload = {
  name: string;
  email: string;
  role: 'homeowner' | 'contractor';
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  createAccount: (payload: CreateAccountPayload) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = 'conforma.auth.user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `user_${Math.random().toString(36).slice(2, 10)}`;
};

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      }
    } catch (error) {
      console.warn('Unable to restore saved session', error);
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async ({ email, name }: LoginPayload) => {
      const sanitizedEmail = email.trim().toLowerCase();
      if (!sanitizedEmail) {
        throw new Error('A valid email address is required to sign in.');
      }

      const nextUser: AuthUser = {
        id: user?.id ?? generateId(),
        email: sanitizedEmail,
        name: name?.trim() || user?.name,
        role: user?.role ?? 'homeowner',
        createdAt: user?.createdAt ?? new Date().toISOString(),
      };

      setUser(nextUser);
      persistUser(nextUser);
    },
    [persistUser, user],
  );

  const createAccount = useCallback(
    async ({ email, name, role }: CreateAccountPayload) => {
      const sanitizedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error('Please share your name so we can personalise your workspace.');
      }

      if (!sanitizedEmail) {
        throw new Error('A valid email address is required to continue.');
      }

      const nextUser: AuthUser = {
        id: generateId(),
        email: sanitizedEmail,
        name: trimmedName,
        role,
        createdAt: new Date().toISOString(),
      };

      setUser(nextUser);
      persistUser(nextUser);
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    setUser(null);
    persistUser(null);
  }, [persistUser]);

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
