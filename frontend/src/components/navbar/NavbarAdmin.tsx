'use client';
/* eslint-disable */
// Chakra Imports
import {
  Box,
  Flex,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import AdminNavbarLinks from './NavbarLinksAdmin';
import { isWindowAvailable } from '@/utils/navigation';
import { useChatContext } from '@/contexts/ChatContext';

export default function AdminNavbar(props: {
  secondary: boolean;
  brandText: string;
  logoText: string;
  onOpen: (...args: any[]) => any;
}) {
  const [scrolled, setScrolled] = useState(false);

  const { activeConversationId, conversations } = useChatContext();

  const activeConversation =
    conversations.find((conv) => conv.id === activeConversationId) || null;

  const currentTitle = activeConversation?.title || 'New Chat';

  const changeNavbar = () => {
    if (isWindowAvailable() && window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    if (isWindowAvailable()) {
      window.addEventListener('scroll', changeNavbar);
    }

    return () => {
      if (isWindowAvailable()) {
        window.removeEventListener('scroll', changeNavbar);
      }
    };
  }, []);

  const { secondary } = props;

  const mainText = useColorModeValue('navy.700', 'white');
  const navbarPosition = 'fixed' as const;
  const navbarFilter = 'none';
  const navbarBackdrop = 'blur(20px)';
  const navbarShadow = 'none';
  const navbarBg = useColorModeValue(
    'rgba(244, 247, 254, 0.2)',
    'rgba(11,20,55,0.5)',
  );
  const navbarBorder = 'transparent';
  const secondaryMargin = '0px';
  const gap = '0px';

  return (
    <Box
      zIndex="100"
      position={navbarPosition}
      boxShadow={navbarShadow}
      bg={navbarBg}
      borderColor={navbarBorder}
      filter={navbarFilter}
      backdropFilter={navbarBackdrop}
      backgroundPosition="center"
      backgroundSize="cover"
      borderRadius="16px"
      borderWidth="1.5px"
      borderStyle="solid"
      transitionDelay="0s, 0s, 0s, 0s"
      transitionDuration="0.25s, 0.25s, 0.25s, 0s"
      transitionProperty="box-shadow, background-color, filter, border"
      transitionTimingFunction="linear, linear, linear, linear"
      alignItems={{ xl: 'center' }}
      display={secondary ? 'block' : 'flex'}
      minH="75px"
      justifyContent={{ xl: 'center' }}
      lineHeight="25.6px"
      mx="auto"
      mt={secondaryMargin}
      pb="8px"
      right={{ base: '12px', md: '30px', lg: '30px', xl: '30px' }}
      px={{
        base: '8px',
        md: '10px',
      }}
      ps={{
        base: '8px',
        md: '12px',
      }}
      pt="8px"
      top={{ base: '12px', md: '16px', xl: '18px' }}
      w={{
        base: 'calc(100vw - 8%)',
        md: 'calc(100vw - 8%)',
        lg: 'calc(100vw - 6%)',
        xl: 'calc(100vw - 350px)',
        '2xl': 'calc(100vw - 365px)',
      }}
    >
      <Flex
        w="100%"
        flexDirection={{
          base: 'column',
          md: 'row',
        }}
        alignItems={{ xl: 'center' }}
        mb={gap}
      >
        <Box mb={{ base: '8px', md: '0px' }}>
          <Link
            color={mainText}
            href="#"
            bg="inherit"
            borderRadius="inherit"
            fontWeight="bold"
            fontSize="34px"
            p="0px"
            _hover={{ color: mainText }}
            _active={{
              bg: 'inherit',
              transform: 'none',
              borderColor: 'transparent',
            }}
            _focus={{
              boxShadow: 'none',
            }}
          >
            {currentTitle}
          </Link>
        </Box>

        <Box ms="auto" w={{ sm: '100%', md: 'unset' }}>
          <AdminNavbarLinks secondary={secondary} />
        </Box>
      </Flex>
    </Box>
  );
}