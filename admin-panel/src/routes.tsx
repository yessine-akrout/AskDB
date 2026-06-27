import { Icon } from "@chakra-ui/react";
import { MdHistory, MdHome, MdPeople, MdSmartToy } from "react-icons/md";
import { IRoute } from "@/types/navigation";

const routes: IRoute[] = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/dashboard",
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  {
    name: "Users",
    layout: "/admin",
    path: "/users",
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
  },
  {
    name: "Journaux",
    layout: "/admin",
    path: "/logs",
    icon: <Icon as={MdHistory} width="20px" height="20px" color="inherit" />,
  },
  {
    name: "Test de discussion",
    layout: "/admin",
    path: "/chat",
    icon: <Icon as={MdSmartToy} width="20px" height="20px" color="inherit" />,
  },
];

export default routes;