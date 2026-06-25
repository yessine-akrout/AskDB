import { mode } from "@chakra-ui/theme-tools";

export const globalStyles = {
  colors: {
    brand: {
      100: "#E9E3FF",
      200: "#422AFB",
      300: "#422AFB",
      400: "#7551FF",
      500: "#422AFB",
      600: "#3311DB",
      700: "#02044A",
      800: "#190793",
      900: "#11047A",
    },
    secondaryGray: {
      100: "#E0E5F2",
      200: "#E2E8F0",
      300: "#F4F7FE",
      400: "#E9EDF7",
      500: "#718096",
      600: "#A3AED0",
      700: "#707EAE",
      800: "#707EAE",
      900: "#1B2559",
    },
    navy: {
      700: "#1B254B",
      800: "#111c44",
      900: "#0b1437",
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        overflowX: "hidden",
        bg: mode("#fdfeff", "navy.900")(props),
        fontFamily: "Plus Jakarta Sans",
      },
      html: {
        fontFamily: "Plus Jakarta Sans",
      },
    }),
  },
};