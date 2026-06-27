"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

const TOKEN_STORAGE_KEY = "auth_token";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setReady(true);
      return;
    }

    if (!token) {
      window.location.href = "/";
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <VStack minH="100vh" justify="center">
        <Spinner />
        <Text>Loading admin panel...</Text>
      </VStack>
    );
  }

  return <>{children}</>;
}