import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import StoreMallDirectoryIcon from "@mui/icons-material/StoreMallDirectory";
import PaymentIcon from "@mui/icons-material/Payment";
import BuildIcon from "@mui/icons-material/Build";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useNavigate } from "react-router-dom";
import AdministradoresCrud from "./AdministradoresCrud"; 
import ClientesCrud from "./ClientesCrud"; 
import OperadoresCrud from "./OperadoresCrud";
import ServiciosCrud from "./ServiciosCrud";
import FormasPagoCrud from "./FormasPagoCrud";
import DispensadorCrud from "./DispensadoresCrud";
import PerchasCrud from "./PerchasCrud";
import ProductosCrud from "./ProductosCrud";

const drawerWidth = 240;

function AdminPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("Administradores");
  const navigate = useNavigate();

  const usuario = localStorage.getItem("usuario"); 

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login"); 
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem button onClick={() => setSelectedPage("Administradores")}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Administradores" />
        </ListItem>

        <ListItem button onClick={() => setSelectedPage("Clientes")}>
          <ListItemIcon>
            <AccountBoxIcon />
          </ListItemIcon>
          <ListItemText primary="Clientes" />
        </ListItem>

        <ListItem button onClick={() => setSelectedPage("Operadores")}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Operadores" />
        </ListItem>

        <ListItem button onClick={() => setSelectedPage("Dispensador")}>
          <ListItemIcon>
            <LocalGasStationIcon />
          </ListItemIcon>
          <ListItemText primary="Dispensador" />
        </ListItem>

        <ListItem button onClick={() => setSelectedPage("Productos")}>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Productos" />
        </ListItem>

        <ListItem button onClick={() => setSelectedPage("Perchas")}>
          <ListItemIcon>
            <StoreMallDirectoryIcon />
          </ListItemIcon>
          <ListItemText primary="Perchas" />
        </ListItem>

        <ListItem button onClick={() => setSelectedPage("Servicios")}>
          <ListItemIcon>
            <BuildIcon />
          </ListItemIcon>
          <ListItemText primary="Servicios" />
        </ListItem>

        <ListItem button onClick={() => setSelectedPage("FormasPago")}>
          <ListItemIcon>
            <PaymentIcon />
          </ListItemIcon>
          <ListItemText primary="Formas de Pago" />
        </ListItem>
        
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </div>
  );

  const renderPage = () => {
    switch (selectedPage) {
      case "Administradores":
        return <AdministradoresCrud />;
      case "Clientes":
        return <ClientesCrud />;
      case "Operadores":
        return <OperadoresCrud />;
      case "Servicios":
        return <ServiciosCrud />;
      case "FormasPago":
        return <FormasPagoCrud />;
      case "Dispensador":
          return <DispensadorCrud />;
      case "Perchas":
          return <PerchasCrud />;
      case "Productos":
          return <ProductosCrud />;
      default:
        return <AdministradoresCrud />;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#1976d2", 
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Bienvenido, {usuario}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
        }}
        aria-label="mailbox folders"
      >
        {/*mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/*desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {}
        {renderPage()}
      </Box>
    </Box>
  );
}

export default AdminPage;
