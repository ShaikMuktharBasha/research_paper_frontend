import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AUTH_STORAGE_KEY = 'ai-research-simplifier-auth-user';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  created_at?: string;
};

type AuthCredentials = {
  email: string;
  password: string;
};

type SignupPayload = AuthCredentials & {
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  login: (payload: AuthCredentials) => Promise<AuthUser>;
  signup: (payload: SignupPayload) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistUser(user: AuthUser | null) {
  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (_error) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      async login(payload) {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, payload);
        const nextUser = response.data.user as AuthUser;
        setUser(nextUser);
        persistUser(nextUser);
        return nextUser;
      },
      async signup(payload) {
        const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, payload);
        const nextUser = response.data.user as AuthUser;
        setUser(nextUser);
        persistUser(nextUser);
        return nextUser;
      },
      logout() {
        setUser(null);
        persistUser(null);
      },
    }),
    [isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
