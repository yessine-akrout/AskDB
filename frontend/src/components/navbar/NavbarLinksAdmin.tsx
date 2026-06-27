'use client';

// Chakra Imports
import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { SidebarResponsive } from '@/components/sidebar/Sidebar';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { MdInfoOutline } from 'react-icons/md';
import routes from '@/routes';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HeaderLinks(props: { secondary: boolean }) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const navbarIcon = useColorModeValue('gray.500', 'white');
  const menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '0px 41px 75px #081132',
  );

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    user?.email?.split('@')[0] ||
    'User';

  const firstName =
    user?.first_name?.trim() ||
    displayName.split(' ')[0] ||
    'User';

  const handleLogout = () => {
    logout();
    router.push('/auth/sign-in');
  };

  return (
    <Flex
      zIndex="100"
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      p="6px"
      gap="6px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <SidebarResponsive routes={routes} />

      <Menu>
        <MenuButton
          p="0px"
          minW="36px"
          h="36px"
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{
            bg: useColorModeValue('gray.100', 'whiteAlpha.200'),
          }}
        >
          <Icon as={MdInfoOutline} color={navbarIcon} w="16px" h="16px" />
        </MenuButton>

        <MenuList
          boxShadow={shadow}
          p="20px"
          me={{ base: '30px', md: 'unset' }}
          borderRadius="20px"
          bg={menuBg}
          border="none"
          mt="22px"
          minW={{ base: 'unset' }}
          maxW={{ base: '360px', md: 'unset' }}
        >
          <Flex flexDirection="column">
            <Text fontSize="sm" fontWeight="600" mb="10px" color={textColor}>
              À propos
            </Text>
            <Text fontSize="sm" color={textColor}>
              ASK DB permet d’interroger une base de données
                          </Text>
            <Text fontSize="sm" color={textColor}>

              en langage naturel, de façon simple et sécurisée.
            </Text>
          </Flex>
        </MenuList>
      </Menu>

      <Button
        variant="ghost"
        bg="transparent"
        p="0px"
        minW="36px"
        h="36px"
        borderRadius="50%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        _hover={{
          bg: useColorModeValue('gray.100', 'whiteAlpha.200'),
        }}
        onClick={toggleColorMode}
      >
        <Icon
          h="16px"
          w="16px"
          color={navbarIcon}
          as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
        />
      </Button>

      <Menu>
        <MenuButton
          p="0px"
          minW="36px"
          h="36px"
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{
            transform: 'scale(1.05)',
          }}
          transition="0.2s"
        >
          <Avatar
            name={displayName}
            src={user?.avatar_url || ''}
            size="sm"
            bg="#11047A"
            color="white"
          />
        </MenuButton>

        <MenuList
          boxShadow={shadow}
          p="0px"
          mt="10px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
          minW="220px"
          overflow="hidden"
        >
          <Flex w="100%" mb="0px" align="center" gap="10px" px="16px" py="14px">
            <Avatar
              name={displayName}
              src={user?.avatar_url || ''}
              size="sm"
              bg="#11047A"
              color="white"
            />
            <Text
              w="100%"
              fontSize="sm"
              fontWeight="700"
              color={textColor}
              noOfLines={1}
            >
              👋 Hello, {firstName}
            </Text>
          </Flex>

          <Box borderTop="1px solid" borderColor={borderColor} />

          <Flex flexDirection="column" p="10px">
            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              color="red.400"
              borderRadius="8px"
              px="14px"
              onClick={handleLogout}
            >
              <Text fontWeight="500" fontSize="sm">
                Se déconnecter
              </Text>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}