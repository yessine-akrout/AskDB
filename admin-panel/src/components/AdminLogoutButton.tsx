"use client";

import { Button } from "@chakra-ui/react";

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

export default function AdminLogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    window.location.href = `${frontendUrl}/auth/sign-in?logout=1`;
  };

  return (
    <Button
      size="sm"
      bg="#7551FF"
      color="white"
      borderRadius="14px"
      _hover={{ bg: "#5c3df5" }}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}