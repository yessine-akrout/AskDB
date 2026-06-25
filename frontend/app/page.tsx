'use client';
/* eslint-disable */

import MessageBoxChat from '@/components/MessageBox';
import { useChatContext } from '@/contexts/ChatContext';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Icon,
  Img,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MdAutoAwesome, MdPerson } from 'react-icons/md';
import Bg from '../public/img/chat/bg-image.png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

type SqlResponse = {
  question?: string;
  sql?: string;
  result?: {
    columns?: string[];
    rows?: (string | number | null)[][];
    row_count?: number;
  };
  row_count?: number;
  status?: string;
  error?: string;
  message?: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseData?: SqlResponse | null;
  outputCode?: string;
};

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function getAuthUser() {
  if (typeof window === 'undefined') return null;

  try {
    return JSON.parse(localStorage.getItem('auth_user') || 'null');
  } catch {
    return null;
  }
}

export default function Chat() {
  const [inputCode, setInputCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    setConversations,
  } = useChatContext();

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const gray = useColorModeValue('gray.500', 'white');
  const textColor = useColorModeValue('navy.700', 'white');
  const tableTextColor = useColorModeValue('#1A202C', '#FFFFFF');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );
  const sqlBoxBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const tableHeaderBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const chatInputWrapperBg = useColorModeValue(
    'rgba(255, 255, 255, 0.94)',
    'rgba(17, 28, 68, 0.88)',
  );

  const chatInputWrapperBorder = useColorModeValue(
    'rgba(226, 232, 240, 0.75)',
    'rgba(255, 255, 255, 0.14)',
  );

  const chatInputWrapperShadow = useColorModeValue(
    '0px 18px 55px rgba(112, 144, 176, 0.20)',
    '0px 18px 55px rgba(0, 0, 0, 0.38)',
  );

  const chatButtonShadow = useColorModeValue(
    '0px 14px 32px rgba(96, 60, 255, 0.34)',
    '0px 14px 34px rgba(96, 60, 255, 0.46)',
  );

  const activeConversation = useMemo(
    () => conversations.find((conv) => conv.id === activeConversationId) || null,
    [conversations, activeConversationId],
  );

  const activeMessages = activeConversation?.messages ?? [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length]);

  const createNewConversation = (title = 'Nouvelle conversation') => {
    const now = new Date().toLocaleString();

    return {
      id: createId(),
      title,
      createdAt: now,
      updatedAt: now,
      messages: [] as ChatMessage[],
    };
  };

  const ensureActiveConversation = (firstQuestion?: string) => {
    if (activeConversationId) return activeConversationId;

    const newConversation = createNewConversation(
      firstQuestion?.slice(0, 40) || 'Nouvelle conversation',
    );

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);

    return newConversation.id;
  };

  const updateConversationMessages = (
    conversationId: string,
    updater: (messages: ChatMessage[]) => ChatMessage[],
    newTitle?: string,
  ) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv;

        return {
          ...conv,
          title: newTitle ?? conv.title,
          updatedAt: new Date().toLocaleString(),
          messages: updater(conv.messages as ChatMessage[]),
        };
      }),
    );
  };

  const handleTranslate = async () => {
    const trimmedInput = inputCode.trim();
    const maxCodeLength = 700;

    if (!trimmedInput) {
      alert('Veuillez saisir votre question.');
      return;
    }

    if (trimmedInput.length > maxCodeLength) {
      alert(
        `Veuillez saisir moins de ${maxCodeLength} caractères. Vous êtes actuellement à ${trimmedInput.length} caractères.`,
      );
      return;
    }

    const currentConversationId = ensureActiveConversation(trimmedInput);

    const currentConversation = conversations.find(
      (conv) => conv.id === currentConversationId,
    );

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmedInput,
    };

    updateConversationMessages(
      currentConversationId,
      (messages) => [...messages, userMessage],
      currentConversation?.title === 'Nouvelle conversation' || !currentConversation
        ? trimmedInput.slice(0, 40)
        : undefined,
    );

    setTimeout(scrollToBottom, 100);

    setInputCode('');
    setLoading(true);

    try {
      const authUser = getAuthUser();

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: trimmedInput,
          user_email: authUser?.email || null,
          user_role: authUser?.role || 'stagiaire',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        const assistantErrorMessage: ChatMessage = {
          id: createId(),
          role: 'assistant',
          content: `Erreur backend (${response.status})`,
          outputCode: `Erreur backend (${response.status}):\n${errorText || 'Erreur inconnue'
            }`,
        };

        updateConversationMessages(currentConversationId, (messages) => [
          ...messages,
          assistantErrorMessage,
        ]);

        setTimeout(scrollToBottom, 100);
        return;
      }

      const data: SqlResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: data.message || data.sql || 'Réponse reçue',
        responseData: data,
      };

      updateConversationMessages(currentConversationId, (messages) => [
        ...messages,
        assistantMessage,
      ]);

      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      const assistantErrorMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: 'Impossible de se connecter au backend FastAPI.',
        outputCode: `Impossible de se connecter au backend FastAPI.\n\n${error?.message || 'Erreur inconnue'
          }`,
      };

      updateConversationMessages(currentConversationId, (messages) => [
        ...messages,
        assistantErrorMessage,
      ]);

      setTimeout(scrollToBottom, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputCode(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !loading) {
      handleTranslate();
    }
  };

  return (
    <Flex
      w="100%"
      pt={{ base: '70px', md: '0px' }}
      direction="column"
      position="relative"
    >
      <Img
        src={Bg.src}
        position="absolute"
        w="350px"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        pointerEvents="none"
      />

      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        minH={{ base: '75vh', '2xl': '85vh' }}
        maxW="1000px"
      >
        <Flex
          direction="column"
          w="100%"
          mb={activeMessages.length > 0 ? '20px' : 'auto'}
        >
          <Accordion color={gray} allowToggle w="100%" my="0px" mx="auto">
            <AccordionItem border="none">
              <AccordionButton
                borderBottom="0px solid"
                maxW="max-content"
                mx="auto"
                _hover={{ border: '0px solid', bg: 'none' }}
                _focus={{ border: '0px solid', bg: 'none' }}
              >
                <Box flex="1" textAlign="left">
                  <Text color={gray} fontWeight="500" fontSize="sm">
                    Connecté au backend FastAPI local
                  </Text>
                </Box>
                <AccordionIcon color={gray} />
              </AccordionButton>

              <AccordionPanel mx="auto" w="max-content" p="0px 0px 10px 0px">
                <Text
                  color={gray}
                  fontWeight="500"
                  fontSize="sm"
                  textAlign="center"
                >
                  Endpoint: {API_URL}/chat
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Flex>

        <Flex
          direction="column"
          w="100%"
          mx="auto"
          display={activeMessages.length > 0 ? 'flex' : 'none'}
          mb="0px"
          gap="16px"
          pb="80px"
        >
          {activeMessages.map((message) =>
            message.role === 'user' ? (
              <Flex key={message.id} w="100%" align="center">
                <Flex
                  borderRadius="full"
                  justify="center"
                  align="center"
                  bg="transparent"
                  border="1px solid"
                  borderColor={borderColor}
                  me="20px"
                  h="40px"
                  minH="40px"
                  minW="40px"
                >
                  <Icon
                    as={MdPerson}
                    width="20px"
                    height="20px"
                    color={brandColor}
                  />
                </Flex>

                <Flex
                  p="22px"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="14px"
                  w="100%"
                  zIndex="2"
                >
                  <Text
                    color={textColor}
                    fontWeight="600"
                    fontSize={{ base: 'sm', md: 'md' }}
                    lineHeight={{ base: '24px', md: '26px' }}
                  >
                    {message.content}
                  </Text>
                </Flex>
              </Flex>
            ) : (
              <Flex key={message.id} w="100%">
                <Flex
                  borderRadius="full"
                  justify="center"
                  align="center"
                  bg="linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)"
                  me="20px"
                  h="40px"
                  minH="40px"
                  minW="40px"
                >
                  <Icon
                    as={MdAutoAwesome}
                    width="20px"
                    height="20px"
                    color="white"
                  />
                </Flex>

                <Box
                  p="22px"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="14px"
                  w="100%"
                  zIndex="2"
                  overflowX="auto"
                  bg="whiteAlpha.50"
                >
                  {message.responseData ? (
                    <Flex direction="column" gap="18px">
                      <Box>
                        <Text color={gray} fontSize="sm" mb="6px" fontWeight="600">
                          SQL généré
                        </Text>

                        <Box
                          p="14px"
                          borderRadius="12px"
                          bg={sqlBoxBg}
                          fontFamily="mono"
                          fontSize="sm"
                          whiteSpace="pre-wrap"
                          overflowX="auto"
                          color={textColor}
                        >
                          {message.responseData.sql || 'Aucun SQL retourné'}
                        </Box>
                      </Box>

                      <Box>
                        <Text color={gray} fontSize="sm" mb="6px" fontWeight="600">
                          Résultat
                        </Text>

                        <Text color={textColor} fontSize="sm" mb="12px">
                          {(message.responseData.result?.row_count ??
                            message.responseData.row_count ??
                            0)}{' '}
                          ligne(s)
                        </Text>

                        {(message.responseData.result?.columns ?? []).length > 0 &&
                          (message.responseData.result?.rows ?? []).length > 0 ? (
                          <Box
                            overflowX="auto"
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="12px"
                          >
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                minWidth: '700px',
                              }}
                            >
                              <thead>
                                <tr style={{ background: tableHeaderBg }}>
                                  {(message.responseData.result?.columns ?? []).map(
                                    (col, index) => (
                                      <th
                                        key={index}
                                        style={{
                                          textAlign: 'left',
                                          padding: '12px',
                                          borderBottom: '1px solid #e2e8f0',
                                          fontSize: '14px',
                                          fontWeight: 600,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {col}
                                      </th>
                                    ),
                                  )}
                                </tr>
                              </thead>

                              <tbody>
                                {(message.responseData.result?.rows ?? []).map(
                                  (row, rowIndex) => (
                                    <tr key={rowIndex}>
                                      {row.map((cell, cellIndex) => (
                                        <td
                                          key={cellIndex}
                                          style={{
                                            padding: '12px',
                                            borderBottom: '1px solid #e2e8f0',
                                            fontSize: '14px',
                                            whiteSpace: 'nowrap',
                                            color: tableTextColor,
                                          }}
                                        >
                                          {cell !== null && cell !== undefined
                                            ? String(cell)
                                            : 'NULL'}
                                        </td>
                                      ))}
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </Box>
                        ) : (
                          <Text color={gray}>Aucune ligne retournée.</Text>
                        )}
                      </Box>

                      {message.responseData.status && (
                        <Text color={gray} fontSize="xs">
                          Statut: {message.responseData.status}
                        </Text>
                      )}
                    </Flex>
                  ) : (
                    <MessageBoxChat output={message.outputCode || ''} />
                  )}
                </Box>
              </Flex>
            ),
          )}

          <Box ref={messagesEndRef} h="1px" />
        </Flex>

        {!activeConversation && (
          <Flex justify="center" mb="10px">
            <Text color={gray} fontSize="sm">
              Commencez une nouvelle conversation pour enregistrer l’historique.
            </Text>
          </Flex>
        )}

        <Box
          position="fixed"
          bottom="18px"
          left={{ base: '0px', xl: '305px' }}
          right="0px"
          zIndex="50"
          pointerEvents="none"
        >
          <Flex
            mx="auto"
            w="100%"
            maxW="1080px"
            px={{ base: '18px', md: '32px', xl: '40px' }}
            justify="center"
            pointerEvents="auto"
          >
            <Flex
              w="100%"
              maxW="980px"
              align="center"
              gap="10px"
              p="8px"
              borderRadius="999px"
              bg={chatInputWrapperBg}
              border="1px solid"
              borderColor={chatInputWrapperBorder}
              boxShadow={chatInputWrapperShadow}
              backdropFilter="blur(18px)"
            >
              <Input
                minH="54px"
                h="54px"
                border="none"
                borderRadius="999px"
                p="15px 22px"
                fontSize="sm"
                fontWeight="500"
                _focus={{
                  border: 'none',
                  boxShadow: 'none',
                }}
                _focusVisible={{
                  border: 'none',
                  boxShadow: 'none',
                }}
                color={inputColor}
                _placeholder={placeholderColor}
                placeholder="Posez votre question ici..."
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                value={inputCode}
                bg="transparent"
              />

              <Button
                variant="primary"
                py="20px"
                px="16px"
                fontSize="sm"
                fontWeight="700"
                borderRadius="999px"
                minW={{ base: '125px', md: '175px' }}
                h="54px"
                bg="linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)"
                boxShadow={chatButtonShadow}
                _hover={{
                  boxShadow:
                    '0px 21px 36px -10px rgba(96, 60, 255, 0.58) !important',
                  bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
                }}
                onClick={handleTranslate}
                isLoading={loading}
              >
                Envoyer
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}