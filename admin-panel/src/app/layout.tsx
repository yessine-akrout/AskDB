"use client";

import React, { ReactNode } from "react";
import { Box, Portal, useDisclosure } from "@chakra-ui/react";
import Sidebar from "@/components/sidebar/Sidebar";
import routes from "@/routes";
import { getActiveRoute, getActiveNavbar } from "@/utils/navigation";
import { usePathname } from "next/navigation";
import AppWrappers from "@/app/AppWrappers";
import Navbar from "@/components/navbar/NavbarAdmin";
import AdminTokenBootstrap from "@/components/AdminTokenBootstrap";
import AdminSessionBootstrap from "@/components/AdminSessionBootstrap";
import AdminGuard from "@/components/AdminGuard";
import "@/app/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { onOpen } = useDisclosure();

  return (
    <html lang="en">
      <body id="root">
        <AppWrappers>
          <AdminTokenBootstrap />
          <AdminSessionBootstrap />
          <AdminGuard>
            <Box>
              <Sidebar routes={routes} />
              <Box
                pt={{ base: "62px", md: "72px" }}
                float="right"
                minHeight="100vh"
                height="100%"
                overflow="auto"
                position="relative"
                maxHeight="100%"
                w={{ base: "100%", xl: "calc(100% - 300px)" }}
                maxWidth={{ base: "100%", xl: "calc(100% - 300px)" }}
                transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
                transitionDuration=".2s, .2s, .35s"
                transitionProperty="top, bottom, width"
                transitionTimingFunction="linear, linear, ease"
              >
                <Portal>
                  <Box>
                    <Navbar
                      onOpen={onOpen}
                      logoText="TextToSQL Admin"
                      brandText={getActiveRoute(routes, pathname)}
                      secondary={getActiveNavbar(routes, pathname)}
                      message={false}
                      fixed={false}
                    />
                  </Box>
                </Portal>

                <Box
                  mx="auto"
                  p={{ base: "16px", md: "20px" }}
                  pe={{ base: "16px", md: "20px" }}
                  minH="100vh"
                  pt={{ base: "20px", md: "24px" }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          </AdminGuard>
        </AppWrappers>
      </body>
    </html>
  );
}