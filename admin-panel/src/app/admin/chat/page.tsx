"use client";
import { Suspense } from 'react';

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { MdAutoAwesome, MdEdit, MdPerson } from "react-icons/md";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
const STORAGE_KEY = "admin_chat_test_conversations";
const ACTIVE_KEY = "admin_chat_test_active_conversation_id";
const HISTORY_EVENT = "admin-chat-history-updated";

type SqlResponse = {
  question?: string;
  sql?: string | null;
  result?: {
    columns?: string[];
    rows?: (string | number | null)[][];
    row_count?: number;
  } | null;
  row_count?: number;
  status?: string;
  error?: string;
  message?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  responseData?: SqlResponse | null;
  outputCode?: string;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function createNewConversation(title = "New conversation"): Conversation {
  const now = new Date().toLocaleString();

  return {
    id: createId(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function saveConversations(
  conversations: Conversation[],
  activeConversationId: string | null,
) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));

  if (activeConversationId) {
    localStorage.setItem(ACTIVE_KEY, activeConversationId);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }

  window.dispatchEvent(new Event(HISTORY_EVENT));
}

function getAuthUser() {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("auth_user") || "null");
  } catch {
    return null;
  }
}

function ResultTable({
  columns,
  rows,
}: {
  columns?: string[];
  rows?: (string | number | null)[][];
}) {
  if (!columns?.length || !rows?.length) return null;

  return (
    <Box
      border="1px solid"
      borderColor="#E9EDF7"
      borderRadius="16px"
      overflow="hidden"
      mt="12px"
      maxW="100%"
      minW="0"
    >
      <Box
        overflowX="auto"
        overflowY="hidden"
        maxW="100%"
        minW="0"
        css={{
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#F8FAFC",
            borderRadius: "999px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#CBD5E1",
            borderRadius: "999px",
          },
        }}
      >
        <table
          style={{
            width: "max-content",
            minWidth: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    fontSize: "14px",
                    color: "#1B2559",
                    borderBottom: "1px solid #E9EDF7",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${rowIndex}-${cellIndex}`}
                    style={{
                      padding: "14px 16px",
                      fontSize: "14px",
                      color: "#1B2559",
                      borderBottom:
                        rowIndex === rows.length - 1
                          ? "none"
                          : "1px solid #E9EDF7",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cell === null || cell === undefined ? "-" : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}

function MessageCard({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isAccessDenied = message.responseData?.status === "access_denied";

  return (
    <Flex align="start" gap="18px" w="100%" maxW="100%" minW="0">
      <Flex
        w="42px"
        h="42px"
        minW="42px"
        borderRadius="full"
        align="center"
        justify="center"
        bg={isUser ? "#F4F7FE" : "#4318FF"}
        color={isUser ? "#4318FF" : "white"}
        mt="2px"
      >
        {isUser ? <MdPerson size={20} /> : <MdAutoAwesome size={18} />}
      </Flex>

      <Box
        flex="1"
        minW="0"
        maxW="100%"
        overflow="hidden"
        bg="white"
        border="1px solid"
        borderColor="#E9EDF7"
        borderRadius="22px"
        px="24px"
        py="20px"
        boxShadow="0px 6px 24px rgba(15, 23, 42, 0.04)"
      >
        <Text
          color="#1B2559"
          fontSize="17px"
          fontWeight="600"
          lineHeight="1.6"
          wordBreak="break-word"
        >
          {message.content}
        </Text>

        {!isUser && message.responseData ? (
          <Box mt="18px" maxW="100%" minW="0" overflow="hidden">
            {isAccessDenied ? (
              <>
                <Text color="#E31A1A" fontSize="15px" fontWeight="700" mb="10px">
                  Access denied
                </Text>

                <Box
                  bg="#FFF5F5"
                  border="1px solid #FEE2E2"
                  borderRadius="16px"
                  px="16px"
                  py="14px"
                  maxW="100%"
                  minW="0"
                  overflow="hidden"
                >
                  <Text
                    color="#E31A1A"
                    fontSize="14px"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                    fontFamily="monospace"
                  >
                    {message.responseData.message ||
                      message.responseData.sql ||
                      "You do not have permission to access this data."}
                  </Text>
                </Box>
              </>
            ) : (
              <>
                <Text color="#707EAE" fontSize="15px" fontWeight="700" mb="10px">
                  Generated SQL
                </Text>

                <Box
                  bg="#F8FAFC"
                  border="1px solid #E9EDF7"
                  borderRadius="16px"
                  px="16px"
                  py="14px"
                  overflowX="auto"
                  overflowY="hidden"
                  maxW="100%"
                  minW="0"
                >
                  <Text
                    color="#1B2559"
                    fontSize="14px"
                    fontFamily="monospace"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {message.responseData.sql || "No SQL generated"}
                  </Text>
                </Box>
              </>
            )}

            {message.responseData.result ? (
              <Box mt="18px" maxW="100%" minW="0" overflow="hidden">
                <Text color="#707EAE" fontSize="15px" fontWeight="700" mb="10px">
                  Result
                </Text>

                <Text color="#1B2559" fontSize="14px" mb="10px">
                  {message.responseData.result.row_count ?? 0} row(s)
                </Text>

                <ResultTable
                  columns={message.responseData.result.columns}
                  rows={message.responseData.result.rows}
                />
              </Box>
            ) : null}

            <Text color="#707EAE" fontSize="14px" mt="14px">
              Status: {message.responseData.status || "unknown"}
            </Text>
          </Box>
        ) : null}

        {!isUser && message.outputCode ? (
          <Box mt="18px" maxW="100%" minW="0" overflow="hidden">
            <Text color="#707EAE" fontSize="15px" fontWeight="700" mb="10px">
              Output
            </Text>

            <Box
              bg="#FFF5F5"
              border="1px solid #FEE2E2"
              borderRadius="16px"
              px="16px"
              py="14px"
              maxW="100%"
              minW="0"
              overflow="hidden"
            >
              <Text
                color="#E31A1A"
                fontSize="14px"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                fontFamily="monospace"
              >
                {message.outputCode}
              </Text>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Flex>
  );
}

function ChatTestPageContent() {
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null,
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    const loadFromStorage = () => {
      const savedConversations = localStorage.getItem(STORAGE_KEY);
      const savedActiveConversationId = localStorage.getItem(ACTIVE_KEY);
      const conversationFromUrl = searchParams.get("conversation");

      if (!savedConversations) {
        setConversations([]);
        setActiveConversationId(null);
        return;
      }

      try {
        const parsed: Conversation[] = JSON.parse(savedConversations);
        setConversations(parsed);

        const preferredId = conversationFromUrl || savedActiveConversationId;

        if (preferredId && parsed.some((c) => c.id === preferredId)) {
          setActiveConversationId(preferredId);
        } else if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
        } else {
          setActiveConversationId(null);
        }
      } catch {
        setConversations([]);
        setActiveConversationId(null);
      }
    };

    loadFromStorage();

    const handleHistoryUpdate = () => {
      loadFromStorage();
    };

    const handleStorage = () => {
      loadFromStorage();
    };

    window.addEventListener(HISTORY_EVENT, handleHistoryUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(HISTORY_EVENT, handleHistoryUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [searchParams]);

  const activeConversation = useMemo(
    () => conversations.find((conv) => conv.id === activeConversationId) || null,
    [conversations, activeConversationId],
  );

  const activeMessages = activeConversation?.messages ?? [];

  const handleNewChat = () => {
    const newConversation = createNewConversation();

    setConversations((prev) => {
      const updated = [newConversation, ...prev];
      saveConversations(updated, newConversation.id);
      return updated;
    });

    setActiveConversationId(newConversation.id);
  };

  const ensureActiveConversation = (firstQuestion?: string) => {
    if (activeConversationId) return activeConversationId;

    const newConversation = createNewConversation(
      firstQuestion?.slice(0, 40) || "New conversation",
    );

    setConversations((prev) => {
      const updated = [newConversation, ...prev];
      saveConversations(updated, newConversation.id);
      return updated;
    });

    setActiveConversationId(newConversation.id);
    return newConversation.id;
  };

  const updateConversationMessages = (
    conversationId: string,
    updater: (messages: ChatMessage[]) => ChatMessage[],
    newTitle?: string,
  ) => {
    setConversations((prev) => {
      const updated = prev.map((conv) => {
        if (conv.id !== conversationId) return conv;

        return {
          ...conv,
          title: newTitle ?? conv.title,
          updatedAt: new Date().toLocaleString(),
          messages: updater(conv.messages),
        };
      });

      saveConversations(updated, conversationId);
      return updated;
    });

    setActiveConversationId(conversationId);
  };

  const handleTranslate = async () => {
    const trimmedInput = inputCode.trim();
    const maxCodeLength = 700;

    if (!trimmedInput) {
      alert("Please enter your message.");
      return;
    }

    if (trimmedInput.length > maxCodeLength) {
      alert(
        `Please enter less than ${maxCodeLength} characters. You are currently at ${trimmedInput.length} characters.`,
      );
      return;
    }

    const currentConversationId = ensureActiveConversation(trimmedInput);

    const currentConversation =
      conversations.find((conv) => conv.id === currentConversationId) || null;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmedInput,
    };

    updateConversationMessages(
      currentConversationId,
      (messages) => [...messages, userMessage],
      currentConversation?.title === "New conversation" || !currentConversation
        ? trimmedInput.slice(0, 40)
        : undefined,
    );

    setInputCode("");
    setLoading(true);

    try {
      const authUser = getAuthUser();

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedInput,
          user_email: authUser?.email || null,
          user_role: authUser?.role || "stagiaire",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        const assistantErrorMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          content: `Backend error (${response.status})`,
          outputCode: `Backend error (${response.status}):\n${
            errorText || "Unknown error"
          }`,
        };

        updateConversationMessages(currentConversationId, (messages) => [
          ...messages,
          assistantErrorMessage,
        ]);

        return;
      }

      const data: SqlResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content:
          data.status === "access_denied"
            ? data.message ||
              data.sql ||
              "Vous n'avez pas l'autorisation d'accéder à ces données."
            : data.sql || "Response received",
        responseData: data,
      };

      updateConversationMessages(currentConversationId, (messages) => [
        ...messages,
        assistantMessage,
      ]);
    } catch (error: any) {
      const assistantErrorMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: "Could not connect to the FastAPI backend.",
        outputCode: `Could not connect to the FastAPI backend.\n\n${
          error?.message || "Unknown error"
        }`,
      };

      updateConversationMessages(currentConversationId, (messages) => [
        ...messages,
        assistantErrorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !loading) {
      handleTranslate();
    }
  };

  return (
    <Flex
      w="100%"
      maxW="100%"
      minW="0"
      overflowX="hidden"
      direction="column"
      position="relative"
      minH="calc(100vh - 120px)"
    >
      <Flex
        direction="column"
        mx="auto"
        w="100%"
        maxW="1000px"
        minW="0"
        overflowX="hidden"
        minH="calc(100vh - 140px)"
      >
        <Flex
          justify="space-between"
          align="center"
          mb="26px"
          w="100%"
          maxW="100%"
          minW="0"
          gap="16px"
        >
          <Text
            color="#1B2559"
            fontSize="48px"
            fontWeight="700"
            lineHeight="100%"
            wordBreak="break-word"
          >
            {activeConversation?.title || "New conversation"}
          </Text>

          <Button
            onClick={handleNewChat}
            bg="#4318FF"
            color="white"
            borderRadius="16px"
            px="18px"
            h="44px"
            minW="fit-content"
            _hover={{ bg: "#3311DB" }}
          >
            <MdEdit style={{ marginRight: 8 }} />
            New Chat
          </Button>
        </Flex>

        <Flex
          direction="column"
          flex="1"
          gap="18px"
          w="100%"
          maxW="100%"
          minW="0"
          overflowX="hidden"
        >
          {activeMessages.length === 0 ? (
            <Flex
              flex="1"
              minH="420px"
              align="center"
              justify="center"
              direction="column"
              textAlign="center"
              maxW="100%"
              minW="0"
            >
              <Text color="#1B2559" fontSize="28px" fontWeight="700" mb="10px">
                Chat Test
              </Text>

              <Text color="#707EAE" fontSize="16px" maxW="520px">
                Test prompts, Generated SQL, and backend responses with the same chat experience as the main interface.
              </Text>
            </Flex>
          ) : (
            activeMessages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))
          )}
        </Flex>

        <Box mt="24px" w="100%" maxW="100%" minW="0">
          <Box
            bg="white"
            border="1px solid #E9EDF7"
            borderRadius="24px"
            px="18px"
            py="14px"
            boxShadow="0px 6px 24px rgba(15, 23, 42, 0.04)"
            maxW="100%"
            minW="0"
            overflow="hidden"
          >
            <Flex align="center" gap="12px" maxW="100%" minW="0">
              <Input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question ici..."
                border="none"
                minW="0"
                _focus={{
                  outline: "none",
                  boxShadow: "none",
                }}
                _focusVisible={{
                  outline: "none",
                  boxShadow: "none",
                }}
                _active={{
                  outline: "none",
                  boxShadow: "none",
                }}
              />

              <Button
                onClick={handleTranslate}
                disabled={loading}
                bg="#4318FF"
                color="white"
                borderRadius="16px"
                px="18px"
                h="42px"
                minW="fit-content"
                _hover={{ bg: "#3311DB" }}
              >
                {loading ? "..." : "Send"}
              </Button>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
export default function ChatTestPage() {
  return (
    <Suspense fallback={<Box p={8}><Text>Chargement...</Text></Box>}>
      <ChatTestPageContent />
    </Suspense>
  );
}
