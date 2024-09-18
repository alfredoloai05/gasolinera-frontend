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
  Tooltip,
  CssBaseline,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import StoreMallDirectoryIcon from "@mui/icons-material/StoreMallDirectory";
import PaymentIcon from "@mui/icons-material/Payment";
import BuildIcon from "@mui/icons-material/Build";
import LogoutIcon from "@mui/icons-material/Logout"; 
import { useNavigate } from "react-router-dom";
import AdministradoresCrud from "./AdministradoresCrud"; 
import ClientesCrud from "./ClientesCrud"; 
import OperadoresCrud from "./OperadoresCrud";
import ServiciosCrud from "./ServiciosCrud";
import FormasPagoCrud from "./FormasPagoCrud";
import DispensadorCrud from "./DispensadoresCrud";
import PerchasCrud from "./PerchasCrud";
import ProductosCrud from "./ProductosCrud";

const drawerWidth = 80; 

function AdminPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("Administradores");
  const [openConfirmLogout, setOpenConfirmLogout] = useState(false);
  const navigate = useNavigate();

  const usuario = localStorage.getItem("usuario"); 

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    setOpenConfirmLogout(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login");
    setOpenConfirmLogout(false);
  };

  const handleCancelLogout = () => {
    setOpenConfirmLogout(false);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[
          { text: "Administradores", icon: <PeopleIcon />, page: "Administradores" },
          { text: "Clientes", icon: <AccountBoxIcon />, page: "Clientes" },
          { text: "Operadores", icon: <PeopleIcon />, page: "Operadores" },
          { text: "Dispensador", icon: <LocalGasStationIcon />, page: "Dispensador" },
          { text: "Productos", icon: <ShoppingCartIcon />, page: "Productos" },
          { text: "Perchas", icon: <StoreMallDirectoryIcon />, page: "Perchas" },
          { text: "Servicios", icon: <BuildIcon />, page: "Servicios" },
          { text: "Formas de Pago", icon: <PaymentIcon />, page: "FormasPago" },
        ].map((item) => (
          <Tooltip title={item.text} placement="right" key={item.text}>
            <ListItem
              button
              onClick={() => {
                setSelectedPage(item.page);
                if (mobileOpen) setMobileOpen(false); 
              }}
              sx={{
                backgroundColor: selectedPage === item.page ? "#A5D6A7" : "transparent",
                borderLeft: selectedPage === item.page ? "4px solid #4CAF50" : "none",
                "&:hover": {
                  backgroundColor: "#C8E6C9",
                },
              }}
            >
              <ListItemIcon sx={{ color: selectedPage === item.page ? "#4CAF50" : "inherit", fontSize: "2rem" }}>
                {item.icon}
              </ListItemIcon>
            </ListItem>
          </Tooltip>
        ))}
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
          background: 'linear-gradient(-45deg, #e1eec3, #f05053, #41a7a8, #f7b42c)',
          backgroundSize: '400% 400%',
          animation: 'gradientAnimation 15s ease infinite',
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
          <IconButton color="inherit" onClick={handleLogout} sx={{ color: "red" }}>
            <LogoutIcon fontSize="medium" />
          </IconButton>
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
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, backgroundColor: "#A5D6A7" },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, backgroundColor: "#A5D6A7" },
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
        <Toolbar /> 
        {renderPage()}

        <Dialog
          open={openConfirmLogout}
          onClose={handleCancelLogout}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#f0f4f4',
              color: '#2e7d32',
              borderRadius: 2,
              boxShadow: 5,
            },
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 700 }}>
            ¿Seguro que quieres cerrar sesión?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{ color: '#388e3c' }}>
              Al cerrar sesión, se cerrará tu sesión actual.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelLogout} sx={{ color: '#388e3c' }}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmLogout}
              sx={{
                backgroundColor: '#4caf50',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#388e3c',
                },
              }}
              autoFocus
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </Box>
  );
}

export default AdminPage;
