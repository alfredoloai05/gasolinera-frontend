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
  ListItemText,
  CssBaseline,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import MenuIcon from "@mui/icons-material/Menu";
import BuildIcon from "@mui/icons-material/Build";
import StorageIcon from "@mui/icons-material/Storage"; // Icono para la nueva pestaña
import { useNavigate } from "react-router-dom";
import GrupoOperador from "./GrupoOperador";
import VentaArticuloOperador from "./VentaArticuloOperador";
import DespachoOperador from "./DespachoOperador";
import ClientesCrud from "../components/VentaCliente";//VentaPlaca //StorageViewer; // Importar el nuevo componente
import Reportes from "./ReportesPage";
import axios from "axios";

const drawerWidth = 240;

function OperadorPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("Grupo");
  const [selectedGrupos, setSelectedGrupos] = useState([]);
  const [openConfirmLogout, setOpenConfirmLogout] = useState(false); // Diálogo de confirmación para cerrar sesión
  const navigate = useNavigate();

  const usuario = localStorage.getItem("usuario");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Obtener los grupos asignados
  const fetchGruposAsignados = async () => {
    try {
      const response = await axios.get("http://localhost:5000/grupos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const gruposAsignados = response.data.filter((grupo) => grupo.id_operador === usuario);
      setSelectedGrupos(gruposAsignados);
    } catch (error) {
      console.error("Error al cargar los grupos asignados", error);
    }
  };

  useEffect(() => {
    fetchGruposAsignados();
  }, []);

  const liberarGrupos = async () => {
    try {
      const gruposAsignados = JSON.parse(localStorage.getItem("gruposAsignados")) || [];

      for (const grupoId of gruposAsignados) {
        console.log(`Liberando grupo ${grupoId}`);
        await axios.put(
          `http://localhost:5000/grupo/${grupoId}/liberar`,
          {},
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        console.log(`Grupo ${grupoId} liberado`);
      }

      console.log("Todos los grupos han sido liberados");
      localStorage.removeItem("gruposAsignados"); // Limpiar los IDs de los grupos asignados
    } catch (error) {
      console.error("Error al liberar los grupos", error);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmLogout) {
      await liberarGrupos(); // Liberar los grupos antes de cerrar sesión
      alert("Grupos liberados exitosamente. Cerrando sesión...");

      // Limpiar datos y redirigir al login
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("usuario");
      navigate("/login");
    }
  };

  // Función para abrir el diálogo de confirmación
  const handleConfirmLogout = () => {
    setOpenConfirmLogout(true);
  };

  // Función para cancelar el cierre de sesión
  const handleCancelLogout = () => {
    setOpenConfirmLogout(false);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {/* Opción Grupos */}
        <ListItem button onClick={() => setSelectedPage("Grupo")}>
          <ListItemIcon>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary="Grupos" />
        </ListItem>

        {/* Opción Despacho */}
        <ListItem button onClick={() => setSelectedPage("DespachoOperador")}>
          <ListItemIcon>
            <LocalGasStationIcon />
          </ListItemIcon>
          <ListItemText primary="Despacho" />
        </ListItem>

        {/* Opción Ventas */}
        <ListItem button onClick={() => setSelectedPage("VentaArticuloOperador")}>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Ventas" />
        </ListItem>

        {/* Opción Storage */}
        <ListItem button onClick={() => setSelectedPage("Clientes")}>
          <ListItemIcon>
            <StorageIcon />
          </ListItemIcon>
          <ListItemText primary="Clientes" />
        </ListItem>

        {/* Opción Storage */}
        <ListItem button onClick={() => setSelectedPage("Reportes")}>
          <ListItemIcon>
            <BuildIcon />
          </ListItemIcon>
          <ListItemText primary="Reportes" />
        </ListItem>


        {/* Opción Cerrar Sesión */}
        <ListItem button onClick={handleConfirmLogout}>
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
        {/* Drawer para pantallas móviles */}
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

        {/* Drawer para pantallas grandes */}
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
        <Toolbar /> {/* Este espacio es para el header */}
        {renderPage()} {/* Contenido de la página */}

        {/* Diálogo de Confirmación para cerrar sesión */}
        <Dialog
          open={openConfirmLogout}
          onClose={handleCancelLogout}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"¿Seguro que quieres cerrar sesión?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Al cerrar sesión, se liberarán todos los grupos asignados.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelLogout} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setOpenConfirmLogout(false); // Cerrar el diálogo
                handleLogout(); // Proceder con el cierre de sesión y liberación de grupos
              }}
              color="primary"
              autoFocus
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default OperadorPage;
