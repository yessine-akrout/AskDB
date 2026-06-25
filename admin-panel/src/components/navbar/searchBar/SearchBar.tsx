'use client';
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

export function SearchBar(props: {
  variant?: string;
  background?: string;
  children?: JSX.Element;
  placeholder?: string;
  borderRadius?: string | number;
  h?: string | number;
  w?: string | number | object;
  [x: string]: any;
}) {
  const { variant, background, children, placeholder, borderRadius, h, w, ...rest } =
    props;

  const searchIconColor = useColorModeValue('gray.700', 'white');
  const inputBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const inputText = useColorModeValue('gray.700', 'gray.100');

  const finalHeight = h ? h : '44px';
  const finalWidth = w ? w : '100%';
  const finalRadius = borderRadius ? borderRadius : '45px';

  return (
    <InputGroup w={finalWidth} h={finalHeight} {...rest}>
      <InputLeftElement h={finalHeight}>
        <IconButton
          aria-label="search"
          bg="inherit"
          borderRadius="inherit"
          h={finalHeight}
          minW="36px"
          _active={{
            bg: 'inherit',
            transform: 'none',
            borderColor: 'transparent',
          }}
          _hover={{
            bg: 'inherit',
            transform: 'none',
            borderColor: 'transparent',
          }}
          _focus={{
            boxShadow: 'none',
          }}
          icon={<SearchIcon color={searchIconColor} w="14px" h="14px" />}
        />
      </InputLeftElement>

      <Input
        variant="search"
        fontSize="sm"
        bg={background ? background : inputBg}
        color={inputText}
        fontWeight="500"
        h={finalHeight}
        w="100%"
        borderRadius={finalRadius}
        pl="42px"
        _placeholder={{ color: 'gray.500', fontSize: '14px' }}
        placeholder={placeholder ? placeholder : 'Search'}
      />
    </InputGroup>
  );
}