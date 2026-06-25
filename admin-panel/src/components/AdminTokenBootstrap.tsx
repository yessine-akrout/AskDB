"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

export default function AdminTokenBootstrap() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (!token) return;

    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    if (user) {
      try {
        const decodedUser = decodeURIComponent(user);
        localStorage.setItem(USER_STORAGE_KEY, decodedUser);
      } catch (error) {
        console.error("Failed to decode admin user payload:", error);
      }
    }

    const cleanPath = pathname || "/admin/dashboard";
    router.replace(cleanPath);
  }, [searchParams, pathname, router]);

  return null;
}