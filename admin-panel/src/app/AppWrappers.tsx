"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import "@/styles/App.css";
import "@/styles/Contact.css";
import "@/styles/MiniCalendar.css";

export default function AppWrappers({ children }: any) {
  return (
    <ChakraProvider value={defaultSystem}>
      {children}
    </ChakraProvider>
  );
}