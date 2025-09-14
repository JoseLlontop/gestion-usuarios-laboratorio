import React from "react";
import {
  Avatar,
  Drawer,
  List,
  Stack,
  Toolbar,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import assets from "../../assets";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";
import appRoutes from "../../routes/appRoutes";
import SidebarItem from "./SidebarItem";
import SidebarItemCollapse from "./SidebarItemCollapse";

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ mobileOpen, onClose }: Props) => {
  const paperSx = {
    boxSizing: "border-box",
    width: sizeConfigs.sidebar.width,
    borderRight: 0,
    backgroundColor: colorConfigs.sidebar.bg,
    color: colorConfigs.sidebar.color,
  } as const;

  const drawerContent = (
    <List disablePadding sx={{ px: 0, overflowX: "hidden" }}>
      <Toolbar sx={{ my: "20px" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%", px: 1 }}
        >
          <Avatar
            src={assets.images.logo}
            variant="square"
            sx={{ width: 115, height: 60, borderRadius: 1 }}
          />
          {/* Flecha para cerrar SOLO en mobile */}
          <Box sx={{ display: { xs: "inline-flex", md: "none" } }}>
            <IconButton aria-label="Cerrar menú" onClick={onClose} size="small" color="inherit">
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
      </Toolbar>

      <Divider sx={{ opacity: 0.12, borderColor: "currentColor" }} />

      {/* Items de navegación */}
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
  );

  return (
    <Box component="nav" aria-label="sidebar">
      {/* Drawer TEMPORAL (mobile) - cubre al AppBar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer PERMANENTE (md+) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
