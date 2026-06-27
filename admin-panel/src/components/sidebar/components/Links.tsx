"use client";

import { Box, Flex, HStack, Text, Button } from "@chakra-ui/react";
import Link from "next/link";
import { IRoute } from "@/types/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MdExpandMore, MdChevronRight } from "react-icons/md";

type ChatConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[];
};

const STORAGE_KEY = "admin_chat_test_conversations";
const ACTIVE_KEY = "admin_chat_test_active_conversation_id";
const HISTORY_OPEN_KEY = "admin_chat_test_history_open";
const HISTORY_EVENT = "admin-chat-history-updated";

export function SidebarLinks(props: { routes: IRoute[] }) {
  const { routes } = props;
  const pathname = usePathname();
  const router = useRouter();

  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const activeRoute = useCallback(
    (routeName: string) => pathname?.includes(routeName),
    [pathname],
  );

  const loadHistory = useCallback(() => {
    try {
      const savedConversations = localStorage.getItem(STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_KEY);
      const savedOpen = localStorage.getItem(HISTORY_OPEN_KEY);

      setHistoryOpen(savedOpen === "true");

      if (savedConversations) {
        const parsed = JSON.parse(savedConversations) as ChatConversation[];
        setChatConversations(parsed);
      } else {
        setChatConversations([]);
      }

      setActiveHistoryId(savedActiveId || null);
    } catch {
      setChatConversations([]);
      setActiveHistoryId(null);
      setHistoryOpen(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();

    const onUpdate = () => loadHistory();
    const onStorage = () => loadHistory();

    window.addEventListener(HISTORY_EVENT, onUpdate);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(HISTORY_EVENT, onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadHistory]);

  const visibleHistory = useMemo(
    () => chatConversations.slice(0, 12),
    [chatConversations],
  );

  const handleToggleHistory = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const next = !historyOpen;
    setHistoryOpen(next);
    localStorage.setItem(HISTORY_OPEN_KEY, String(next));
  };

  const handleSelectConversation = (
    e: React.MouseEvent<HTMLDivElement>,
    conversationId: string,
    targetPath: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    localStorage.setItem(ACTIVE_KEY, conversationId);
    setActiveHistoryId(conversationId);
    window.dispatchEvent(new Event(HISTORY_EVENT));
    router.push(`/admin${targetPath}?conversation=${encodeURIComponent(conversationId)}`);
  };

  const createLinks = (items: IRoute[]) => {
    return items.map((route, index) => {
      if (route.layout !== "/admin") return null;

      const isActive = activeRoute(route.path.toLowerCase());

      const isChatRoute =
        route.path === "/chat" ||
        route.path === "/chat-test" ||
        route.name.toLowerCase().includes("chat");

      const isChatPage =
        pathname?.includes("/admin/chat") ||
        pathname?.includes("/admin/chat-test");

      return (
        <Box key={index} position="relative" w="100%">
          <Link href={route.layout + route.path}>
            <Box position="relative" w="100%">
              <HStack gap={isActive ? "22px" : "26px"} py="11px" ps="10px" pe="0px">
                <Flex w="100%" alignItems="center" justifyContent="center">
                  <Box color={isActive ? "#4318FF" : "#A3AED0"} me="18px">
                    {route.icon}
                  </Box>

                  <Text
                    me="auto"
                    color={isActive ? "#1B2559" : "#A3AED0"}
                    fontWeight={isActive ? "700" : "500"}
                    fontSize="md"
                    lineHeight="100%"
                  >
                    {route.name}
                  </Text>

                  {isChatRoute ? (
                    <Button
                      onClick={handleToggleHistory}
                      variant="ghost"
                      minW="28px"
                      w="28px"
                      h="28px"
                      p="0"
                      borderRadius="10px"
                      bg="transparent"
                      _hover={{ bg: "#F4F7FE" }}
                      color={isActive ? "#4318FF" : "#A3AED0"}
                      me="8px"
                    >
                      {historyOpen ? (
                        <MdExpandMore size={18} />
                      ) : (
                        <MdChevronRight size={18} />
                      )}
                    </Button>
                  ) : null}
                </Flex>

                <Box
                  h="36px"
                  w="4px"
                  bg={isActive ? "#4318FF" : "transparent"}
                  borderRadius="5px"
                  position="absolute"
                  right="0px"
                />
              </HStack>
            </Box>
          </Link>

          {isChatRoute && historyOpen ? (
            <Box ps="35px" pe="10px" pb="10px">
              {visibleHistory.length === 0 ? (
                <Text color="#A3AED0" fontSize="13px" py="6px">
                  Aucun historique
                </Text>
              ) : (
                <Box
                  maxH="260px"
                  overflowY="auto"
                  overflowX="hidden"
                  pr="4px"
                  css={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(112, 144, 176, 0.45) transparent",
                  }}
                >
                  <Flex direction="column" gap="6px">
                    {visibleHistory.map((conv) => {
                      const selected = activeHistoryId === conv.id && isChatPage;

                      return (
                        <Box
                          key={conv.id}
                          onClick={(e) =>
                            handleSelectConversation(e, conv.id, route.path)
                          }
                          cursor="pointer"
                          px="12px"
                          py="9px"
                          borderRadius="12px"
                          bg={selected ? "#F4F7FE" : "transparent"}
                          _hover={{ bg: "#F8FAFC" }}
                        >
                          <Text
                            color={selected ? "#1B2559" : "#707EAE"}
                            fontSize="13px"
                            fontWeight={selected ? "700" : "500"}
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {conv.title || "New conversation"}
                          </Text>
                        </Box>
                      );
                    })}
                  </Flex>
                </Box>
              )}
            </Box>
          ) : null}
        </Box>
      );
    });
  };

  return <>{createLinks(routes)}</>;
}

export default SidebarLinks;