import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";

type Props = {
  onOpenSidebar: () => void;
};

const Topbar = ({ onOpenSidebar }: Props) => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: { xs: "100%", md: `calc(100% - ${sizeConfigs.sidebar.width})` },
        ml: { md: sizeConfigs.sidebar.width },
        bgcolor: colorConfigs.mainBg,       // mismo fondo que el layout
        color: "inherit",
        borderBottom: 0,                    // sin línea/borde
        boxShadow: "none",                  // sin sombra
      }}
    >
      <Toolbar>
        {/* Botón hamburguesa visible SOLO en mobile */}
        <IconButton
          color="inherit"
          aria-label="open sidebar"
          onClick={onOpenSidebar}
          sx={{ mr: 2, display: { xs: "inline-flex", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flex: 1 }} />
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
