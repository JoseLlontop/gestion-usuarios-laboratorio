import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import { useState } from "react";

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: colorConfigs.mainBg,
        overflowX: "hidden",
      }}
    >
      {/* Topbar con botón hamburguesa (abre el sidebar en mobile) */}
      <Topbar onOpenSidebar={() => setMobileOpen(true)} />

      {/* Cuerpo: sidebar + contenido */}
      <Box sx={{ display: "flex", width: "100%" }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: "100%", md: `calc(100% - ${sizeConfigs.sidebar.width})` },
            minHeight: "100vh",
            bgcolor: colorConfigs.mainBg,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;