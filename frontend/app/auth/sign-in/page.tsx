'use client';

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  RadioGroup,
  Radio,
  Stack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

export default function SignInPage() {
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();
  const { login } = useAuthContext();

  const pageBg = useColorModeValue('#F4F7FE', '#0B1437');
  const cardBg = useColorModeValue('rgba(255,255,255,0.88)', 'rgba(17,28,68,0.88)');
  const rightPanelBg = useColorModeValue('rgba(255,255,255,0.72)', 'rgba(17,28,68,0.72)');
  const textColor = useColorModeValue('navy.700', 'white');
  const secondaryText = useColorModeValue('gray.500', 'gray.400');
  const subtleText = useColorModeValue('#718096', '#A3AED0');
  const inputBg = useColorModeValue('rgba(244,247,254,0.95)', 'whiteAlpha.100');
  const inputBorder = useColorModeValue('rgba(226,232,240,1)', 'whiteAlpha.200');
  const purpleGradient = 'linear-gradient(135deg, #4A25E1 0%, #7B5AFF 100%)';
  const leftOverlay = 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const demoEmail = role === 'admin' ? 'messi@gmail.com' : 'yessine.akrout123@gmail.com';
      await login(demoEmail, '1234');
      // Router push is handled in AuthContext for demo mode based on role
    } catch (error: any) {
      setErrorMessage(error?.message || 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex
      minH="100dvh"
      w="100%"
      bg={pageBg}
      overflow="hidden"
      align="center"
      justify="center"
      px={{ base: '12px', md: '20px', xl: '28px' }}
      py={{ base: '12px', md: '18px' }}
      position="relative"
    >
      <Box
        position="absolute"
        top="-120px"
        left="-120px"
        w="320px"
        h="320px"
        borderRadius="full"
        bg="rgba(123,90,255,0.10)"
        filter="blur(70px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-140px"
        right="-100px"
        w="360px"
        h="360px"
        borderRadius="full"
        bg="rgba(74,37,225,0.10)"
        filter="blur(80px)"
        pointerEvents="none"
      />

      <Flex
        w="100%"
        maxW="1280px"
        h={{ base: 'auto', lg: 'calc(100dvh - 36px)' }}
        maxH={{ base: 'none', lg: '860px' }}
        borderRadius="32px"
        overflow="hidden"
        direction={{ base: 'column', lg: 'row' }}
        bg={cardBg}
        backdropFilter="blur(18px)"
        border="1px solid"
        borderColor="whiteAlpha.300"
        boxShadow="0px 25px 80px rgba(112, 144, 176, 0.18)"
        position="relative"
      >
        <Flex
          w={{ base: '100%', lg: '36%' }}
          bg={purpleGradient}
          color="white"
          direction="column"
          justify="space-between"
          px={{ base: '24px', md: '30px', xl: '38px' }}
          py={{ base: '24px', md: '30px', xl: '36px' }}
          position="relative"
        >
          <Box
            position="absolute"
            inset="0"
            bg={leftOverlay}
            pointerEvents="none"
          />

          <Box position="relative" zIndex="1">
<Flex align="center" gap="9px" mb="42px">
  <Text
    color="white"
    fontSize={{ base: "32px", md: "36px" }}
    fontWeight="800"
    lineHeight="1"
    letterSpacing="-1px"
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
</Flex>            <Box
              display="inline-flex"
              px="12px"
              py="6px"
              borderRadius="full"
              bg="whiteAlpha.180"
              mb="18px"
            >
              <Text fontSize="xs" fontWeight="700" letterSpacing="0.6px">
                ESPACE PROFESSIONNEL
              </Text>
            </Box>

            <Heading
              fontSize={{ base: '28px', md: '34px', xl: '40px' }}
              lineHeight="1.12"
              fontWeight="800"
              maxW="420px"
              mb="18px"
            >
              Connectez-vous à votre espace Text-to-SQL
            </Heading>

            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              lineHeight="1.75"
              color="whiteAlpha.900"
              maxW="420px"
            >
              Retrouvez vos conversations, votre historique et votre environnement
              de travail IA dans une interface élégante, claire et structurée.
            </Text>
          </Box>

          <Box
            position="relative"
            zIndex="1"
            mt="24px"
            p="20px"
            borderRadius="24px"
            bg="rgba(255,255,255,0.14)"
            backdropFilter="blur(14px)"
            border="1px solid rgba(255,255,255,0.14)"
            maxW="420px"
          >
            <Text fontSize="sm" fontWeight="700" mb="8px">
              Accès sécurisé
            </Text>
            <Text fontSize="sm" lineHeight="1.7" color="whiteAlpha.880">
              Les identifiants de connexion sont fournis par l’administrateur de
              votre entreprise.
            </Text>
          </Box>
        </Flex>

        <Flex
          flex="1"
          bg={rightPanelBg}
          backdropFilter="blur(12px)"
          align="center"
          justify="center"
          px={{ base: '22px', md: '34px', xl: '60px' }}
          py={{ base: '24px', md: '28px', xl: '36px' }}
        >
          <Box w="100%" maxW="500px">
            <Text
              fontSize="sm"
              fontWeight="700"
              color={secondaryText}
              letterSpacing="0.4px"
              mb="8px"
            >
              CONNEXION
            </Text>

            <Heading
              color={textColor}
              fontSize={{ base: '30px', md: '40px' }}
              lineHeight="1.08"
              mb="10px"
              fontWeight="800"
            >
              Se connecter
            </Heading>

            <Text color={subtleText} fontSize="md" mb="28px" lineHeight="1.7">
              Entrez vos identifiants pour accéder à votre environnement ask.
            </Text>

            <Box as="form" onSubmit={handleSubmit}>
              <FormControl mb="24px">
                <FormLabel color={textColor} fontSize="sm" fontWeight="700" mb="12px">
                  Choisissez un compte de démonstration :
                </FormLabel>
                <RadioGroup onChange={(val: 'admin' | 'user') => setRole(val)} value={role}>
                  <Stack direction="column" spacing="16px">
                    <Box
                      p="16px"
                      borderWidth="1px"
                      borderRadius="12px"
                      borderColor={role === 'admin' ? '#7B5AFF' : inputBorder}
                      bg={role === 'admin' ? 'rgba(123,90,255,0.05)' : inputBg}
                      cursor="pointer"
                      onClick={() => setRole('admin')}
                    >
                      <Radio value="admin" colorScheme="purple" size="lg">
                        <Box ml="10px">
                          <Text fontWeight="700" color={textColor}>Compte Administrateur</Text>
                          <Text fontSize="sm" color={subtleText}>Accès complet : tableau de bord, utilisateurs, logs et requêtes illimitées.</Text>
                        </Box>
                      </Radio>
                    </Box>
                    <Box
                      p="16px"
                      borderWidth="1px"
                      borderRadius="12px"
                      borderColor={role === 'user' ? '#7B5AFF' : inputBorder}
                      bg={role === 'user' ? 'rgba(123,90,255,0.05)' : inputBg}
                      cursor="pointer"
                      onClick={() => setRole('user')}
                    >
                      <Radio value="user" colorScheme="purple" size="lg">
                        <Box ml="10px">
                          <Text fontWeight="700" color={textColor}>Compte Utilisateur (Directeur)</Text>
                          <Text fontSize="sm" color={subtleText}>Accès limité : recherche de base de données uniquement (Chat).</Text>
                        </Box>
                      </Radio>
                    </Box>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Flex align="center" mb="20px">
                <Checkbox colorScheme="purple" defaultChecked>
                  <Text color={secondaryText} fontSize="sm">
                    Se souvenir de moi
                  </Text>
                </Checkbox>
              </Flex>

              {errorMessage ? (
                <Text color="red.400" fontSize="sm" mb="14px">
                  {errorMessage}
                </Text>
              ) : null}

              <Button
                type="submit"
                w="100%"
                h="56px"
                borderRadius="45px"
                fontSize="sm"
                fontWeight="700"
                color="white"
                bg={purpleGradient}
                isLoading={submitting}
                _hover={{
                  boxShadow: '0px 21px 27px -10px rgba(96, 60, 255, 0.48)',
                  bg: purpleGradient,
                }}
                _active={{
                  bg: purpleGradient,
                }}
              >
                Se connecter
              </Button>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}