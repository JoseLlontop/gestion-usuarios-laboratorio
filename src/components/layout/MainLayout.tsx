import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";

const MainLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Topbar />
      <Box component="nav" sx={{ width: sizeConfigs.sidebar.width, flexShrink: 0 }}>
        <Sidebar />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0, // 👈 eliminar padding global
          width: `calc(100% - ${sizeConfigs.sidebar.width})`,
          minHeight: "100vh",
          height: "100%",
          backgroundColor: colorConfigs.mainBg
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;