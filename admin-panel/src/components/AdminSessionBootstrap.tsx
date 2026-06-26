"use client";

import { useEffect } from "react";

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5001";

export default function AdminSessionBootstrap() {
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;

    const fetchMe = async () => {
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && token === 'mock-demo-token') {
        const mockUser = { id: 'demo-id', email: 'admin@askdb.demo', first_name: 'Demo', last_name: 'Admin', role: 'admin' };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        if (data?.user) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        }
      } catch (error) {
        console.error("Failed to bootstrap admin session:", error);
      }
    };

    fetchMe();
  }, []);

  return null;
}