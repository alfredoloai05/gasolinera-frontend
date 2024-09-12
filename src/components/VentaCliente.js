import React, { useState } from "react";
import {
  Fab,
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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

function VentaCliente() {
  const [cliente, setCliente] = useState(null);
  const [placas, setPlacas] = useState([]);
  const [cedulaBuscar, setCedulaBuscar] = useState(""); // Cedula a buscar
  const [openAddModal, setOpenAddModal] = useState(false); 
  const [openEditModal, setOpenEditModal] = useState(false); 
  const [openPlacasModal, setOpenPlacasModal] = useState(false); 
  const [newCliente, setNewCliente] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
    cedula: cedulaBuscar, // Ya inicializado con la cédula buscada
  });
  const [editCliente, setEditCliente] = useState({
    id: "",
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
    cedula: "",
  });
  const [newPlaca, setNewPlaca] = useState({
    numero: "",
    cedula_cliente: "",
  });

  // Buscar cliente por cédula
  const buscarClientePorCedula = async (cedula) => {
    try {
      const response = await axios.get(`http://localhost:5000/cliente/cedula/${cedula}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCliente(response.data);
      fetchPlacasByCliente(response.data.cedula); // Cargar las placas del cliente encontrado
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setCliente(null); // Cliente no encontrado
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
    } catch (error) {
      console.error("Error al cargar placas", error);
    }
  };

  const handleOpenAddModal = () => {
    setNewCliente({ ...newCliente, cedula: cedulaBuscar }); // Iniciar el modal con la cédula ya ingresada
    setOpenAddModal(true);
  };
  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleOpenEditModal = (cliente) => {
    setEditCliente({
      id: cliente.id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      correo: cliente.correo,
      direccion: cliente.direccion,
      cedula: cliente.cedula,
    });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => setOpenEditModal(false);

  const handleOpenPlacasModal = (cliente) => {
    if (cliente.cedula) { 
      fetchPlacasByCliente(cliente.cedula); 
      setNewPlaca({ numero: "", cedula_cliente: cliente.cedula });
      setOpenPlacasModal(true);
    }
  };

  const handleClosePlacasModal = () => setOpenPlacasModal(false);

  const handleAddClienteChange = (e) => {
    setNewCliente({ ...newCliente, [e.target.name]: e.target.value });
  };

  const handleEditClienteChange = (e) => {
    setEditCliente({ ...editCliente, [e.target.name]: e.target.value });
  };

  // Crear un nuevo cliente y luego buscarlo
  const handleAddClienteSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/cliente", newCliente, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      handleCloseAddModal();
      buscarClientePorCedula(newCliente.cedula); // Buscar y cargar el cliente recién creado
    } catch (error) {
      console.error("Error al crear cliente", error);
    }
  };

  const handleEditClienteSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/cliente/${editCliente.cedula}`, editCliente, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      handleCloseEditModal();
      buscarClientePorCedula(editCliente.cedula); // Actualizar los datos del cliente editado
    } catch (error) {
      console.error("Error al actualizar cliente", error);
    }
  };

  const handleDeleteCliente = async (cliente) => {
    try {
      await axios.delete(`http://localhost:5000/cliente/${cliente.cedula}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCliente(null);
    } catch (error) {
      console.error("Error al eliminar cliente", error);
    }
  };

  const handlePlacaSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/placa", newPlaca, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPlacasByCliente(newPlaca.cedula_cliente);
    } catch (error) {
      console.error("Error al crear placa", error);
    }
  };

  const handleDeletePlaca = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/placa/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPlacasByCliente(newPlaca.cedula_cliente);
    } catch (error) {
      console.error("Error al eliminar placa", error);
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

      {/* Mostrar cliente encontrado o modal para crear nuevo */}
      {cliente ? (
        <div>
          <Typography variant="h6">
            {cliente.nombre} {cliente.apellido}
          </Typography>
          <Typography variant="body1">Cédula: {cliente.cedula}</Typography>
          <Typography variant="body1">Correo: {cliente.correo}</Typography>
          <Typography variant="body1">Dirección: {cliente.direccion}</Typography>

          {/* Acciones para Editar y Eliminar Cliente */}
          <IconButton onClick={() => handleOpenEditModal(cliente)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteCliente(cliente)}>
            <DeleteIcon />
          </IconButton>
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

      {/* Modal para editar cliente */}
      <Modal open={openEditModal} onClose={handleCloseEditModal}>
        <Box sx={style} component="form" onSubmit={handleEditClienteSubmit}>
          <Typography variant="h6" gutterBottom>
            Editar Cliente
          </Typography>
          <TextField
            label="Nombre"
            name="nombre"
            fullWidth
            value={editCliente.nombre}
            onChange={handleEditClienteChange}
            margin="normal"
            required
          />
          <TextField
            label="Apellido"
            name="apellido"
            fullWidth
            value={editCliente.apellido}
            onChange={handleEditClienteChange}
            margin="normal"
            required
          />
          <TextField
            label="Cédula"
            name="cedula"
            fullWidth
            value={editCliente.cedula}
            onChange={handleEditClienteChange}
            margin="normal"
            required
            disabled // No se permite editar la cédula
          />
          <TextField
            label="Correo"
            name="correo"
            fullWidth
            value={editCliente.correo}
            onChange={handleEditClienteChange}
            margin="normal"
            required
          />
          <TextField
            label="Dirección"
            name="direccion"
            fullWidth
            value={editCliente.direccion}
            onChange={handleEditClienteChange}
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Guardar Cambios
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
                <IconButton onClick={() => handleDeletePlaca(placa.id)}>
                  <DeleteIcon />
                </IconButton>
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
