"use client";

import React from "react";
import {
  Box,
  Flex,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import Content from "@/components/sidebar/components/Content";
import { IoMenuOutline } from "react-icons/io5";
import { IRoute } from "@/types/navigation";

interface SidebarResponsiveProps {
  routes: IRoute[];
}

interface SidebarProps extends SidebarResponsiveProps {
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const { routes } = props;

  return (
    <Box display={{ base: "none", xl: "block" }} position="fixed" minH="100%">
      <Box
        bg="white"
        w="285px"
        ms={{ sm: "0px" }}
        my={{ sm: "12px" }}
        h="calc(100vh - 24px)"
        m="0px"
        borderRadius="18px"
        minH="100%"
        overflow="hidden"
        boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      >
        <Content routes={routes} />
      </Box>
    </Box>
  );
}

export function SidebarResponsive(props: SidebarResponsiveProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLDivElement | null>(null);
  const { routes } = props;

  return (
    <Flex display={{ sm: "flex", xl: "none" }} alignItems="center">
      <Flex ref={btnRef} w="max-content" h="max-content" onClick={onOpen}>
        <Icon
          as={IoMenuOutline}
          color="#A3AED0"
          my="auto"
          w="20px"
          h="20px"
          me="10px"
          _hover={{ cursor: "pointer" }}
        />
      </Flex>

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent
          w="285px"
          maxW="285px"
          ms={{ sm: "16px" }}
          my={{ sm: "16px" }}
          borderRadius="16px"
          bg="white"
        >
          <DrawerCloseButton
            zIndex="3"
            onClick={onClose}
            _focus={{ boxShadow: "none" }}
            _hover={{ boxShadow: "none" }}
          />
          <DrawerBody maxW="285px" px="0rem" pb="0">
            <Content routes={routes} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}

export default Sidebar;