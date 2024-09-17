import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function VentaCliente({ cedulaInicial, onClienteEncontrado, onLimpiar }) {
  const [cliente, setCliente] = useState(null);
  const [placas, setPlacas] = useState([]);
  const [cedulaBuscar, setCedulaBuscar] = useState(cedulaInicial || ""); 
  const [openAddModal, setOpenAddModal] = useState(false); 
  const [openPlacasModal, setOpenPlacasModal] = useState(false); 
  const [newCliente, setNewCliente] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
    cedula: cedulaBuscar,
  });
  const [newPlaca, setNewPlaca] = useState({
    numero: "",
    cedula_cliente: "",
  });

  useEffect(() => {
    if (cedulaInicial) {
      buscarClientePorCedula(cedulaInicial);
    }
  }, [cedulaInicial]);

  // Función para limpiar los campos
  const limpiarCampos = () => {
    setCedulaBuscar("");
    setCliente(null);
    setPlacas([]);
    setNewCliente({
      nombre: "",
      apellido: "",
      correo: "",
      direccion: "",
      cedula: "",
    });
    setNewPlaca({
      numero: "",
      cedula_cliente: "",
    });
  };

  // Llamar a onLimpiar cuando se necesite limpiar el componente desde fuera
  useEffect(() => {
    if (onLimpiar) {
      onLimpiar(limpiarCampos);
    }
  }, [onLimpiar]);

  // Buscar cliente por cédula
  const buscarClientePorCedula = async (cedula) => {
    try {
      const response = await axios.get(`http://localhost:5000/cliente/cedula/${cedula}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCliente(response.data);
      const placasCliente = await fetchPlacasByCliente(response.data.cedula);

      // Devolver los datos del cliente y las placas al componente padre
      onClienteEncontrado({ ...response.data, placas: placasCliente });
      
      if (placasCliente.length === 0) {
        handleOpenPlacasModal(response.data);
      }
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setCliente(null);
        handleOpenAddModal(); // Abrir modal para agregar nuevo cliente
      } else {
        console.error("Error al buscar cliente", error);
      }
    }
  };

  // Obtener las placas del cliente
  const fetchPlacasByCliente = async (cedula) => {
    try {
      const response = await axios.get(`http://localhost:5000/cliente/${cedula}/placas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPlacas(response.data);
      return response.data;
    } catch (error) {
      console.error("Error al cargar placas", error);
      return [];
    }
  };

  const handleOpenAddModal = () => {
    setNewCliente({ ...newCliente, cedula: cedulaBuscar }); 
    setOpenAddModal(true);
  };
  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleOpenPlacasModal = (cliente) => {
    setNewPlaca({ numero: "", cedula_cliente: cliente.cedula });
    setOpenPlacasModal(true);
  };

  const handleClosePlacasModal = () => setOpenPlacasModal(false);

  const handleAddClienteChange = (e) => {
    setNewCliente({ ...newCliente, [e.target.name]: e.target.value });
  };

  // Crear un nuevo cliente y luego abrir el modal de placas si no tiene
  const handleAddClienteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/cliente", newCliente, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCliente(response.data);
      handleCloseAddModal();
      handleOpenPlacasModal(response.data); // Abrir el modal de placas tras crear cliente
    } catch (error) {
      console.error("Error al crear cliente", error);
    }
  };

  const handlePlacaSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/placa", newPlaca, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchPlacasByCliente(newPlaca.cedula_cliente);
      handleClosePlacasModal(); // Cerrar modal tras añadir la placa
    } catch (error) {
      console.error("Error al crear placa", error);
    }
  };

  return (
    <div>
      <h2>Buscar Cliente por Cédula</h2>
      <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
          label="Cédula"
          value={cedulaBuscar}
          onChange={(e) => setCedulaBuscar(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Tooltip title="Buscar Cliente">
          <IconButton onClick={() => buscarClientePorCedula(cedulaBuscar)}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Mostrar cliente encontrado o mensaje */}
      {cliente ? (
        <div>
          <Typography variant="h6">
            {cliente.nombre} {cliente.apellido}
          </Typography>
          <Typography variant="body1">Cédula: {cliente.cedula}</Typography>
          <Typography variant="body1">Correo: {cliente.correo}</Typography>
          <Typography variant="body1">Dirección: {cliente.direccion}</Typography>
          <IconButton onClick={() => handleOpenPlacasModal(cliente)}>
            <LocalParkingIcon />
          </IconButton>
        </div>
      ) : (
        <Typography variant="body1">No se encontró cliente.</Typography>
      )}

      {/* Modal para agregar nuevo cliente */}
      <Modal open={openAddModal} onClose={handleCloseAddModal}>
        <Box sx={style} component="form" onSubmit={handleAddClienteSubmit}>
          <Typography variant="h6" gutterBottom>
            Agregar Nuevo Cliente
          </Typography>
          <TextField
            label="Nombre"
            name="nombre"
            fullWidth
            value={newCliente.nombre}
            onChange={handleAddClienteChange}
            margin="normal"
            required
          />
          <TextField
            label="Apellido"
            name="apellido"
            fullWidth
            value={newCliente.apellido}
            onChange={handleAddClienteChange}
            margin="normal"
            required
          />
          <TextField
            label="Cédula"
            name="cedula"
            fullWidth
            value={newCliente.cedula}
            onChange={handleAddClienteChange}
            margin="normal"
            required
          />
          <TextField
            label="Correo"
            name="correo"
            fullWidth
            value={newCliente.correo}
            onChange={handleAddClienteChange}
            margin="normal"
            required
          />
          <TextField
            label="Dirección"
            name="direccion"
            fullWidth
            value={newCliente.direccion}
            onChange={handleAddClienteChange}
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Agregar
          </Button>
        </Box>
      </Modal>

      {/* Modal para gestionar placas */}
      <Modal open={openPlacasModal} onClose={handleClosePlacasModal}>
        <Box sx={style} component="form" onSubmit={handlePlacaSubmit}>
          <Typography variant="h6" gutterBottom>
            Gestionar Placas del Cliente
          </Typography>
          {placas.length > 0 ? (
            placas.map((placa) => (
              <Box key={placa.id} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1">Placa: {placa.numero}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2">No hay placas asociadas.</Typography>
          )}
          <TextField
            label="Nueva Placa"
            name="numero"
            fullWidth
            value={newPlaca.numero}
            onChange={(e) => setNewPlaca({ ...newPlaca, numero: e.target.value })}
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Agregar Placa
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default VentaCliente;
