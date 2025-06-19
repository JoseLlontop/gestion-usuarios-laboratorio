import { Avatar, Drawer, List, Stack, Toolbar } from "@mui/material";
import assets from "../../assets";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";
import appRoutes from "../../routes/appRoutes";
import SidebarItem from "./SidebarItem";
import SidebarItemCollapse from "./SidebarItemCollapse";

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sizeConfigs.sidebar.width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sizeConfigs.sidebar.width,
          boxSizing: "border-box",
          borderRight: "0px",
          backgroundColor: colorConfigs.sidebar.bg,
          color: colorConfigs.sidebar.color,
        },
      }}
    >
      <List disablePadding>
        <Toolbar sx={{ marginBottom: "20px", marginTop: "20px" }}>
          <Stack sx={{ width: "100%" }} direction="row" justifyContent="center">
            {/* Opción 1: usar variant="square" y darle un tamaño fijo */}
            <Avatar
              src={assets.images.logo}
              variant="square"
              sx={{
                width: 115,       // ancho deseado
                height: 60,       // alto deseado
                borderRadius: 1,  // bordes ligeramente redondeados (1 = 4px). Pon 0 si los quieres totalmente rectos
              }}
            />

            {/*
            // Opción 2: si prefieres usar un <img> en lugar de <Avatar>, por ejemplo:

            <Box
              component="img"
              src={assets.images.logo}
              alt="Logo"
              sx={{
                width: 120,
                height: 60,
                objectFit: "contain", // adapta la imagen al contenedor
              }}
            />
            */}
          </Stack>
        </Toolbar>

        {appRoutes.map((route, index) =>
          route.sidebarProps ? (
            route.child ? (
              <SidebarItemCollapse item={route} key={index} />
            ) : (
              <SidebarItem item={route} key={index} />
            )
          ) : null
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;