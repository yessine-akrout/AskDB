'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import { ChangeEvent, PropsWithChildren } from 'react';
import { IRoute } from '@/types/navigation';
import { FiLogOut } from 'react-icons/fi';
import { SearchBar } from '@/components/navbar/searchBar/SearchBar';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SidebarContentProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function SidebarContent(props: SidebarContentProps) {
  const router = useRouter();

  const { user, logout } = useAuthContext();

  const {
    filteredConversations,
    searchQuery,
    setSearchQuery,
    activeConversationId,
    handleNewChat,
    setActiveConversationId,
  } = useChatContext();

  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const shadowPillBar = useColorModeValue(
    '4px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'none',
  );
  const gray = useColorModeValue('gray.500', 'whiteAlpha.700');
  const conversationHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const activeConversationBg = useColorModeValue('purple.50', 'whiteAlpha.200');
  const sidebarBg = useColorModeValue('white', 'navy.800');
  const dividerColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const userBlockBg = useColorModeValue('white', 'whiteAlpha.100');
  const fadeTop = useColorModeValue(
    'linear(to-b, white, rgba(255,255,255,0))',
    'linear(to-b, #111C44, rgba(17,28,68,0))',
  );
  const fadeBottom = useColorModeValue(
    'linear(to-t, white, rgba(255,255,255,0))',
    'linear(to-t, #111C44, rgba(17,28,68,0))',
  );
  const scrollbarThumb = useColorModeValue(
    'rgba(112, 144, 176, 0.55)',
    'rgba(255,255,255,0.25)',
  );

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    user?.email?.split('@')[0] ||
    'User';

  const handleLogout = () => {
    logout();
    router.push('/auth/sign-in');
  };

  return (
    <Flex
      direction="column"
      h="calc(100vh - 32px)"
      maxH="calc(100vh - 32px)"
      bg={sidebarBg}
      borderRadius="30px"
      px="16px"
      pt="6px"
      pb="12px"
      overflow="hidden"
    >
      {/* Header */}
      <Box flexShrink={0}>
        <Flex justify="center" align="center" h="64px" mb="10px">
          <Flex align="center" gap="9px">
            <Text
              color={textColor}
              fontSize="25px"
              fontWeight="900"
              lineHeight="1"
              letterSpacing="-0.7px"
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
              fontSize="12px"
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
        </Flex>

        <Box borderBottom="1px solid" borderColor={dividerColor} mb="16px" />

        {/* New Chat */}
        <Button
          w="100%"
          h="44px"
          borderRadius="45px"
          fontSize="sm"
          fontWeight="600"
          color="white"
          bg="linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)"
          mb="12px"
          transition="0.2s"
          _hover={{
            boxShadow: '0px 21px 27px -10px rgba(96, 60, 255, 0.48)',
          }}
          onClick={handleNewChat}
        >
          +   New chat
        </Button>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          placeholder="Rechercher une conversation..."
          borderRadius="45px"
          h="44px"
          w="100%"
          mb="16px"
        />

        <Text
          fontSize="xs"
          fontWeight="700"
          color={gray}
          textTransform="uppercase"
          letterSpacing="0.6px"
          mb="10px"
          px="4px"
        >
          Conversations
        </Text>
      </Box>

      {/* Conversations */}
      <Box position="relative" flex="1" minH="0">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          h="10px"
          zIndex="2"
          pointerEvents="none"
          bgGradient={fadeTop}
        />

        <Box
          h="100%"
          overflowY="auto"
          pr="4px"
          pb="8px"
          css={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${scrollbarThumb} transparent`,
          }}
        >
          <Stack spacing={2}>
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <Box
                  key={conv.id}
                  px="12px"
                  py="10px"
                  borderRadius="12px"
                  cursor="pointer"
                  bg={
                    activeConversationId === conv.id
                      ? activeConversationBg
                      : 'transparent'
                  }
                  _hover={{
                    bg:
                      activeConversationId === conv.id
                        ? activeConversationBg
                        : conversationHoverBg,
                  }}
                  onClick={() => setActiveConversationId(conv.id)}
                  transition="0.2s"
                >
                  <Text
                    fontSize="sm"
                    fontWeight={
                      activeConversationId === conv.id ? '700' : '500'
                    }
                    color={textColor}
                    noOfLines={1}
                  >
                    {conv.title || 'New conversation'}
                  </Text>
                </Box>
              ))
            ) : (
              <Text fontSize="sm" color={gray} px="4px">
                no conversations found
              </Text>
            )}
          </Stack>
        </Box>

        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          h="12px"
          zIndex="2"
          pointerEvents="none"
          bgGradient={fadeBottom}
        />
      </Box>

      {/* User block */}
      <Box flexShrink={0} pt="12px" borderTop="1px solid" borderColor={dividerColor}>
        <Flex
          align="center"
          bg={userBlockBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="18px"
          p="10px"
          boxShadow={shadowPillBar}
        >
          <Avatar
            size="sm"
            name={displayName}
            src={user?.avatar_url || undefined}
            me="10px"
          />

          <Box flex="1" minW="0">
            <Text
              color={textColor}
              fontSize="sm"
              fontWeight="700"
              noOfLines={1}
            >
              {displayName}
            </Text>

            <Text color={gray} fontSize="xs" fontWeight="500" noOfLines={1}>
              {({ stagiaire: 'Intern', directeur: 'Director', admin: 'Admin' } as Record<string, string>)[user?.role || ''] || user?.role || 'user'}
            </Text>
          </Box>

          <Flex
            as="button"
            type="button"
            w="34px"
            h="34px"
            borderRadius="12px"
            align="center"
            justify="center"
            color={gray}
            transition="0.2s"
            _hover={{
              color: '#4318FF',
              bg: 'purple.50',
            }}
            onClick={handleLogout}
          >
            <Icon as={FiLogOut} boxSize="18px" />
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}

export default SidebarContent;