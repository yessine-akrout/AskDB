"use client";

import Link from "next/link";
import { Box, VStack, Text } from "@chakra-ui/react";

export default function Sidebar() {
  return (
    <Box
      w="250px"
      minH="100vh"
      borderRight="1px solid"
      borderColor="gray.200"
      p={5}
    >
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        TextToSQL
      </Text>

      <VStack align="start" gap={3}>
        <Link href="/">Dashboard</Link>
        <Link href="/users">Users</Link>
        <Link href="/logs">Logs</Link>
        <Link href="/chat">Chat</Link>
      </VStack>
    </Box>
  );
}