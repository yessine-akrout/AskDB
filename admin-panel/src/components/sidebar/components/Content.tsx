"use client";

import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import Brand from "@/components/sidebar/components/Brand";
import Links from "@/components/sidebar/components/Links";
import { IRoute } from "@/types/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarContentProps {
  routes: IRoute[];
}

type AdminUser = {
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
};

function SidebarContent(props: SidebarContentProps) {
  const { routes } = props;
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      setUser(null);
    }
  }, []);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.email?.split("@")[0] ||
    "Admin";

  const avatarSrc = user?.avatar_url || "";

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    window.location.href = `${frontendUrl}/auth/sign-in?logout=1`;
  };

  return (
    <Flex direction="column" height="100%" pt="8px">
      <Brand />

      <Stack direction="column" mt="10px" mb="auto">
        <Box ps="18px" pe="0px">
          <Links routes={routes} />
        </Box>
      </Stack>

      <Box ps="18px" pe="18px" mt="auto" mb="32px">
        <Flex
          align="center"
          bg="white"
          border="1px solid"
          borderColor="#E9EDF7"
          borderRadius="18px"
          p="10px"
          boxShadow="4px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          {avatarSrc ? (
            <Box
              as="img"
              src={avatarSrc}
              alt={displayName}
              w="40px"
              h="40px"
              borderRadius="50%"
              objectFit="cover"
              me="10px"
            />
          ) : (
            <Flex
              w="40px"
              h="40px"
              borderRadius="50%"
              align="center"
              justify="center"
              bg="linear-gradient(135deg, #7B61FF 0%, #5B3DF5 100%)"
              color="white"
              fontSize="14px"
              fontWeight="800"
              me="10px"
            >
              {displayName.charAt(0).toUpperCase()}
            </Flex>
          )}

          <Box flex="1" minW="0">
            <Text
              color="#1B2559"
              fontSize="sm"
              fontWeight="700"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {displayName}
            </Text>

            <Text
              color="#718096"
              fontSize="xs"
              fontWeight="500"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              admin
            </Text>
          </Box>


        </Flex>
      </Box>
    </Flex>
  );
}

export default SidebarContent;