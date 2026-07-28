// The bar across the top of every page. The menu icon opens the sidebar.

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SideBar from "./SideBar";
import ColorModeIconDropdown from "../shared-theme/ColorModeIconDropdown";

export default function NavBar() {
  const [sideBarOpen, setSideBarOpen] = React.useState(false);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          >
            SCHEDULR
          </Typography>
          <ColorModeIconDropdown
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          />
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setSideBarOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SideBar open={sideBarOpen} onClose={() => setSideBarOpen(false)} />
    </Box>
  );
}
