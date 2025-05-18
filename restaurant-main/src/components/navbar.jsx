import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
} from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import InsightsIcon from "@mui/icons-material/Insights";
import InventoryIcon from "@mui/icons-material/Inventory";
import { AuthContext } from "../context/auth";

export default function Navbar() {
  const { user } = useContext(AuthContext);
  
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
        >
          {/* Logo and Name */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RestaurantMenuIcon
              sx={{ color: "#e7582b", mr: 1, fontSize: 32 }}
            />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                color: "#333",
                display: { xs: "none", md: "flex" },
                letterSpacing: "0.05em",
              }}
            >
              Restoranti
            </Typography>
          </Link>

          {/* Mobile Menu Icon */}
          <IconButton
            size="large"
            sx={{
              display: { xs: "flex", md: "none" },
              color: "#333",
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {!user && (
              <>
                <Button
                  startIcon={<AdminPanelSettingsIcon />}
                  component={Link}
                  to="/login/admin"
                  sx={{
                    color: "#333",
                    "&:hover": { backgroundColor: "#f9f9f9" },
                  }}
                >
                  Admin Login
                </Button>
                <Button
                  startIcon={<PersonIcon />}
                  component={Link}
                  to="/login/staff"
                  sx={{
                    color: "#333",
                    "&:hover": { backgroundColor: "#f9f9f9" },
                  }}
                >
                  Staff Login
                </Button>
              </>
            )}
            
            {user?.role === 'kamarier' && (
              <Button
                startIcon={<LocalDiningIcon />}
                component={Link}
                to="/dashboard/waiter"
                sx={{
                  color: "#333",
                  "&:hover": { backgroundColor: "#f9f9f9" },
                }}
              >
                Waiter Dashboard
              </Button>
            )}
            
            {user?.role === 'admin' && (
              <>
                <Button
                  startIcon={<AdminPanelSettingsIcon />}
                  component={Link}
                  to="/admin/manager"
                  sx={{
                    color: "#333",
                    "&:hover": { backgroundColor: "#f9f9f9" },
                  }}
                >
                  Manager Panel
                </Button>
                <Button
                  startIcon={<InventoryIcon />}
                  component={Link}
                  to="/admin/inventory"
                  sx={{
                    color: "#333",
                    "&:hover": { backgroundColor: "#f9f9f9" },
                  }}
                >
                  Inventory
                </Button>
                <Button
                  startIcon={<InsightsIcon />}
                  component={Link}
                  to="/admin/analytics"
                  sx={{
                    color: "#333",
                    "&:hover": { backgroundColor: "#f9f9f9" },
                  }}
                >
                  Analytics
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
