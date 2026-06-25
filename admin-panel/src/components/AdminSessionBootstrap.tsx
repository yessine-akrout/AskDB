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