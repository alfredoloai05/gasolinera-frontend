import React, { useState, useEffect } from "react";
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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import MenuIcon from "@mui/icons-material/Menu";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StorageIcon from "@mui/icons-material/Storage";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import GrupoOperador from "./GrupoOperador";
import VentaArticuloOperador from "./VentaArticuloOperador";
import DespachoOperador from "./DespachoOperador";
import ClientesCrud from "./ClientesCrudOperador";
import Reportes from "./ReportesPage";
import UltimaVenta from "./UltimasVentas";
import axios from "axios";
import config from '../config'; 

const drawerWidth = 80; 

function OperadorPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("Grupo");
  const [openConfirmLogout, setOpenConfirmLogout] = useState(false);
  const [nombreOperador, setNombreOperador] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  const idOperador = localStorage.getItem("id_operador");

  useEffect(() => {
    const fetchNombreOperador = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/operador/${idOperador}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setNombreOperador(response.data.nombre);
      } catch (error) {
        console.error("Error al obtener el nombre del operador:", error);
      }
    };

    if (idOperador) {
      fetchNombreOperador();
    }
  }, [idOperador]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const liberarGrupos = async () => {
    try {
      const gruposAsignados = JSON.parse(localStorage.getItem("gruposAsignados")) || [];

      for (const grupoId of gruposAsignados) {
        await axios.put(
          `${config.apiUrl}/grupo/${grupoId}/liberar`,
          {},
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
      }

      localStorage.removeItem("gruposAsignados");
    } catch (error) {
      console.error("Error al liberar los grupos", error);
    }
  };

  const handleLogout = async () => {
    await liberarGrupos();

    setSnackbarMessage("Grupos liberados exitosamente. Cerrando sesión...");
    setSnackbarOpen(true);

    localStorage.clear();
    navigate("/login");
  };

  const handleConfirmLogout = () => {
    setOpenConfirmLogout(true);
  };

  const handleCancelLogout = () => {
    setOpenConfirmLogout(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[
          { text: "Grupos", icon: <GroupIcon />, page: "Grupo" },
          { text: "Despacho", icon: <LocalGasStationIcon />, page: "DespachoOperador" },
          { text: "Ventas", icon: <ShoppingCartIcon />, page: "VentaArticuloOperador" },
          { text: "Clientes", icon: <StorageIcon />, page: "Clientes" },
          { text: "Reportes", icon: <AssessmentIcon />, page: "Reportes" },
          { text: "Últimas Ventas", icon: <ReceiptIcon />, page: "UltimaVenta" }, // Icono actualizado para "Últimas Ventas"
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
      case "Grupo":
        return <GrupoOperador />;
      case "VentaArticuloOperador":
        return <VentaArticuloOperador />;
      case "DespachoOperador":
        return <DespachoOperador />;
      case "Clientes":
        return <ClientesCrud />;
      case "Reportes":
        return <Reportes />;
      case "UltimaVenta":
        return <UltimaVenta />;
      default:
        return <GrupoOperador />;
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
            Bienvenido, {nombreOperador}
          </Typography>
          <IconButton color="inherit" onClick={handleConfirmLogout} sx={{ color: "red" }}>
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
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#A5D6A7",
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "#A5D6A7",
            },
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
          backgroundColor: "#FFFFFF",
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
              Al cerrar sesión, se liberarán todos los grupos asignados.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelLogout} sx={{ color: '#388e3c' }}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setOpenConfirmLogout(false);
                handleLogout();
              }}
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default OperadorPage;
