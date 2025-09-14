import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import colorConfigs from "../../configs/colorConfigs";

type Props = {
  onOpenSidebar: () => void;
};

const Topbar = ({ onOpenSidebar }: Props) => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        display: { xs: "block", md: "none" },
        width: "100%",
        bgcolor: colorConfigs.sidebar.activeBg,
        color: "inherit",
        boxShadow: "none",
      }}
    >
      <Toolbar disableGutters sx={{ px: 2 }}>
        <IconButton
          aria-label="open sidebar"
          onClick={onOpenSidebar}
          edge="start"
          sx={{
            mr: 1,
            color: (theme) => theme.palette.common.white // <- fuerza blanca
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flex: 1 }} />
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;

