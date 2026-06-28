"use client";

import { Box, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { MdInfoOutline, MdDarkMode, MdLightMode } from "react-icons/md";
import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { SidebarResponsive } from "@/components/sidebar/Sidebar";
import routes from "@/routes";

type AuthUser = {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

const USER_STORAGE_KEY = "auth_user";
const TOKEN_STORAGE_KEY = "auth_token";
const THEME_STORAGE_KEY = "admin_theme";
const COMMON_LOGIN_URL = "http://localhost:3000/auth/sign-in?logout=1";

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeAvatarUrl(url?: string) {
  if (!url) return "";

  let value = url.trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  value = value.replace(/\\/g, "/");

  if (value.startsWith("/")) {
    return value;
  }

  const fileName = value.split("/").pop() || "";
  if (fileName && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(fileName)) {
    return `/img/users/${fileName}`;
  }

  return "";
}

export default function NavbarLinksAdmin() {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [openProfile, setOpenProfile] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const dark = savedTheme === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    async function loadCurrentUser() {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setUser(readStoredUser());
          return;
        }

        const currentUser = data.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        }

        setImageError(false);
      } catch {
        setUser(readStoredUser());
      }
    }

    loadCurrentUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpenProfile(false);
        setOpenAbout(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // ignore
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    window.location.href = COMMON_LOGIN_URL;
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  const fullName = useMemo(() => {
    const fn = user?.first_name?.trim() || "";
    const ln = user?.last_name?.trim() || "";
    const combined = `${fn} ${ln}`.trim();
    if (combined) return combined;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  }, [user]);

  const helloName = useMemo(() => {
    if (user?.first_name?.trim()) return user.first_name.trim();
    if (user?.last_name?.trim()) return user.last_name.trim();
    if (user?.email) return user.email.split("@")[0];
    return "User";
  }, [user]);

  const initials = useMemo(() => {
    const firstInitial = user?.first_name?.trim()?.[0]?.toUpperCase() || "";
    const lastInitial = user?.last_name?.trim()?.[0]?.toUpperCase() || "";
    const emailInitial = user?.email?.trim()?.[0]?.toUpperCase() || "U";
    return `${firstInitial}${lastInitial}`.trim() || firstInitial || emailInitial;
  }, [user]);

  const avatar = normalizeAvatarUrl(user?.avatar_url);
  const hasAvatar = !!avatar && !imageError;

  const surfaceBg = isDark ? "#111C44" : "white";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#E9EDF7";
  const textColor = isDark ? "white" : "#1B2559";
  const mutedColor = "#A3AED0";
  const softBg = isDark ? "rgba(255,255,255,0.08)" : "#F4F7FE";
  const shellShadow = isDark
    ? "0px 8px 24px rgba(0,0,0,0.28)"
    : "0px 8px 24px rgba(0,0,0,0.05)";
  const dropdownShadow = isDark
    ? "0px 18px 38px rgba(0,0,0,0.35)"
    : "0px 18px 38px rgba(0,0,0,0.09)";

  return (
    <Flex
      ref={wrapperRef}
      align="center"
      bg={surfaceBg}
      borderRadius="30px"
      px="12px"
      py="8px"
      gap="12px"
      boxShadow={shellShadow}
      position="relative"
      minH="50px"
    >
      <SidebarResponsive routes={routes} />
      <Box position="relative">
        <Icon
          as={MdInfoOutline}
          color={mutedColor}
          w="17px"
          h="17px"
          cursor="pointer"
          onClick={() => {
            setOpenAbout((prev) => !prev);
            setOpenProfile(false);
          }}
        />

        {openAbout && (
          <Box
            position="absolute"
            top="32px"
            right="-14px"
            bg={surfaceBg}
            borderRadius="16px"
            minW="220px"
            p="12px"
            boxShadow={dropdownShadow}
            zIndex="2000"
            border={`1px solid ${borderColor}`}
          >
            <Text color={textColor} fontSize="14px" fontWeight="700" mb="4px">
              About the admin panel
            </Text>
            <Text color={mutedColor} fontSize="13px" lineHeight="1.5">
              manage users and monitor the ASKDB administration space.
            </Text>
          </Box>
        )}
      </Box>

      <Box
        w="34px"
        h="34px"
        borderRadius="full"
        overflow="hidden"
        cursor="pointer"
        onClick={() => {
          setOpenProfile((prev) => !prev);
          setOpenAbout(false);
        }}
        flexShrink={0}
        bg={hasAvatar ? "transparent" : softBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {hasAvatar ? (
          <Image
            src={avatar}
            alt={fullName}
            w="100%"
            h="100%"
            objectFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Text
            color={textColor}
            fontSize="13px"
            fontWeight="700"
            lineHeight="100%"
          >
            {initials}
          </Text>
        )}
      </Box>

      {openProfile && (
        <Box
          position="absolute"
          top="58px"
          right="0"
          bg={surfaceBg}
          borderRadius="18px"
          minW="228px"
          overflow="hidden"
          boxShadow={dropdownShadow}
          zIndex="2000"
          border={`1px solid ${borderColor}`}
        >
          <Flex align="center" p="12px" gap="10px">
            <Box
              w="34px"
              h="34px"
              borderRadius="full"
              overflow="hidden"
              flexShrink={0}
              bg={hasAvatar ? "transparent" : softBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {hasAvatar ? (
                <Image
                  src={avatar}
                  alt={fullName}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text
                  color={textColor}
                  fontSize="13px"
                  fontWeight="700"
                  lineHeight="100%"
                >
                  {initials}
                </Text>
              )}
            </Box>

            <Text fontWeight="600" color={textColor} fontSize="14px">
              👋 Hello, {helloName}
            </Text>
          </Flex>

          <Box h="1px" bg={borderColor} />

          <Box
            p="10px 12px"
            fontSize="14px"
            color="#FF4D4F"
            fontWeight="500"
            cursor="pointer"
            _hover={{ bg: isDark ? "rgba(255,255,255,0.04)" : "#FFF5F5" }}
            onClick={handleLogout}
          >
            Sign out
          </Box>
        </Box>
      )}
    </Flex>
  );
}