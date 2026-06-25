"use client";

import { Box, Flex, Text } from "@chakra-ui/react";

export default function SidebarBrand() {
  return (
    <Flex alignItems="center" flexDirection="column" pt="10px" pb="6px">
      <Flex mt="30px" mb="30px" align="center" gap="9px">
        <Text
          color="#1B2559"
          fontSize="32px"
          fontWeight="900"
          letterSpacing="-1px"
          lineHeight="100%"
        >
          ASK
        </Text>

        <Box
          position="relative"
          px="8px"
          py="4px"
          borderRadius="999px"
          bg="linear-gradient(135deg, rgba(123,97,255,0.95) 0%, rgba(67,24,255,1) 55%, rgba(91,61,245,0.95) 100%)"
          color="white"
          fontSize="14px"
          fontWeight="900"
          lineHeight="1"
          letterSpacing="0.7px"
          border="1px solid rgba(255,255,255,0.45)"
          boxShadow="inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 18px rgba(67,24,255,0.28)"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-40%"
            left="-20%"
            w="70%"
            h="120%"
            bg="linear-gradient(120deg, rgba(255,255,255,0.55), rgba(255,255,255,0))"
            transform="rotate(18deg)"
            opacity="0.55"
          />

          <Box as="span" position="relative" zIndex={1}>
            DB
          </Box>
        </Box>
      </Flex>

      <Box w="100%" h="1px" bg="#E9EDF7" mb="26px" />
    </Flex>
  );
}