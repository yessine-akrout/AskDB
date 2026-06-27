"use client";

import { Button } from "@chakra-ui/react";

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

export default function AdminLogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    window.location.href = "/";
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