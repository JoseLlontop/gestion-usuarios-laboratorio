import HomePage from "../pages/home/HomePage";
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import { RouteType } from "./config";
import GestionBecarios from "../pages/becario/GestionBecarios";

const appRoutes: RouteType[] = [
  {
    index: true,
    element: <HomePage />,
    state: "home"
  },
  {
    path: "/informacion",
    element: <HomePage />,
    state: "informacion",
    sidebarProps: {
      displayText: "Informacion General",
      icon: <HomeIcon />
    }
  },

  {
    path: "/gestionBecarios",
    element: <GestionBecarios />,
    state: "gestionBecarios",
    sidebarProps: {
      displayText: "Becarios",
      icon: <GroupIcon />
    },
    child: [
      {
        path: "/gestionBecarios/gestion",
        element: <GestionBecarios />,
        state: "gestionBecarios.gestion",
        sidebarProps: {
          displayText: "Lista de Becarios",
        }
      }
    ]
  }

];

export default appRoutes;