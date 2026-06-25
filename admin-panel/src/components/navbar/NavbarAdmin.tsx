"use client";
/* eslint-disable */

import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import AdminNavbarLinks from "@/components/navbar/NavbarLinksAdmin";

export default function AdminNavbar(props: {
  secondary: boolean;
  message?: string | boolean;
  brandText: string;
  logoText?: string;
  fixed?: boolean;
  onOpen: (...args: any[]) => any;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const changeNavbar = () => {
      if (window.scrollY > 1) setScrolled(true);
      else setScrolled(false);
    };

    window.addEventListener("scroll", changeNavbar);
    return () => window.removeEventListener("scroll", changeNavbar);
  }, []);

  const { secondary, brandText } = props;

  return (
    <Box
      position="fixed"
      bg="rgba(244, 247, 254, 0.2)"
      backdropFilter="blur(20px)"
      borderRadius="16px"
      borderWidth="1.5px"
      borderStyle="solid"
      borderColor="transparent"
      alignItems={{ xl: "center" }}
      display={secondary ? "block" : "flex"}
      minH="72px"
      justifyContent={{ xl: "center" }}
      lineHeight="25.6px"
      mx="auto"
      pb="8px"
      right={{ base: "12px", md: "24px", lg: "24px", xl: "24px" }}
      px={{ base: "8px", md: "10px" }}
      ps={{ base: "8px", md: "12px" }}
      pt="8px"
      top={{ base: "10px", md: "12px", xl: "12px" }}
      w={{
        base: "calc(100vw - 8%)",
        md: "calc(100vw - 7%)",
        lg: "calc(100vw - 6%)",
        xl: "calc(100vw - 325px)",
        "2xl": "calc(100vw - 340px)",
      }}
      zIndex="100"
    >
      <Flex
        w="100%"
        flexDirection={{ base: "column", md: "row" }}
        alignItems={{ xl: "center" }}
        mb="0px"
      >
        <Box mb={{ base: "8px", md: "0px" }}>
          <Text color="#707EAE" fontSize="sm" mb="3px" fontWeight="500">
            Pages / {brandText}
          </Text>

          <Link
            color="#1B2559"
            href="#"
            bg="inherit"
            borderRadius="inherit"
            fontWeight="700"
            fontSize="34px"
            lineHeight="100%"
            p="0px"
            _hover={{ color: "#1B2559" }}
            _active={{
              bg: "inherit",
              transform: "none",
              borderColor: "transparent",
            }}
            _focus={{ boxShadow: "none" }}
          >
            {brandText}
          </Link>
        </Box>

        <Box ms="auto" w={{ sm: "100%", md: "unset" }}>
          <AdminNavbarLinks />
        </Box>
      </Flex>
    </Box>
  );
}