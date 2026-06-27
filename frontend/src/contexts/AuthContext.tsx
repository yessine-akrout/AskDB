'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5001';
const ADMIN_PANEL_URL = 'http://localhost:3001/admin/dashboard';
const MAIN_APP_URL = 'http://localhost:3000/';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const savedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (!savedToken || !savedUser) {
          setLoading(false);
          return;
        }

        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Please fill in all fields.');
    }

    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Login failed.');
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

    setToken(data.access_token);
    setUser(data.user);

    if (data.user?.role === 'admin') {
      const encodedToken = encodeURIComponent(data.access_token);
      const encodedUser = encodeURIComponent(JSON.stringify(data.user));
      window.location.href = `${ADMIN_PANEL_URL}?token=${encodedToken}&user=${encodedUser}`;
      return;
    }

    window.location.href = MAIN_APP_URL;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      loading,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }
  return context;
}