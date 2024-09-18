import React, { useState, useEffect } from "react";
import {
  Fab,
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import CrudTable from "../components/CrudTable";
import axios from "axios";
import config from '../config'; 

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  fontFamily: "Poppins, sans-serif",
};

function ClientesCrud() {
  const [clientes, setClientes] = useState([]);
  const [placas, setPlacas] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPlacasModal, setOpenPlacasModal] = useState(false);
  const [currentCedulaCliente, setCurrentCedulaCliente] = useState("");
  const [searchCedula, setSearchCedula] = useState("");
  const [searchPlaca, setSearchPlaca] = useState("");

  const [newCliente, setNewCliente] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
    telefono: "",
    tipo_identificacion: "C",
    cedula: "",
  });
  const [editCliente, setEditCliente] = useState({
    id: "",
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
    telefono: "",
    tipo_identificacion: "C",
    cedula: "",
  });
  const [newPlaca, setNewPlaca] = useState({
    numero: "",
    cedula_cliente: "",
  });

  const fetchClientes = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/clientes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClientes(response.data);
      setFilteredClientes(response.data);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    }
  };

  const fetchPlacasByCliente = async (cedula) => {
    try {
      const response = await axios.get(
        `${config.apiUrl}/cliente/${cedula}/placas`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPlacas(response.data);
    } catch (error) {
      console.error("Error al cargar placas", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    const { cedula } = newCliente;
    if (cedula.length === 10) {
      setNewCliente((prev) => ({ ...prev, tipo_identificacion: "C" }));
    } else if (cedula.length === 13) {
      setNewCliente((prev) => ({ ...prev, tipo_identificacion: "R" }));
    } else {
      setNewCliente((prev) => ({ ...prev, tipo_identificacion: "P" }));
    }
  }, [newCliente.cedula]);

  useEffect(() => {
    const { cedula } = editCliente;
    if (cedula.length === 10) {
      setEditCliente((prev) => ({ ...prev, tipo_identificacion: "C" }));
    } else if (cedula.length === 13) {
      setEditCliente((prev) => ({ ...prev, tipo_identificacion: "R" }));
    } else {
      setEditCliente((prev) => ({ ...prev, tipo_identificacion: "P" }));
    }
  }, [editCliente.cedula]);

  const handleSearchByCedula = async () => {
    if (searchCedula.trim() !== "") {
      try {
        const response = await axios.get(
          `${config.apiUrl}/cliente/cedula/${searchCedula}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setFilteredClientes([response.data]);
      } catch (error) {
        console.error("Error al buscar cliente por cédula", error);
      }
    } else {
      setFilteredClientes(clientes);
    }
  };

  const handleSearchByPlaca = async () => {
    if (searchPlaca.trim() !== "") {
      try {
        const response = await axios.get(
          `${config.apiUrl}/placa/${searchPlaca}/cliente`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setFilteredClientes([response.data]);
      } catch (error) {
        console.error("Error al buscar cliente por placa", error);
      }
    } else {
      setFilteredClientes(clientes);
    }
  };

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleOpenEditModal = (cliente) => {
    setEditCliente({
      id: cliente.id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      correo: cliente.correo,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      tipo_identificacion: cliente.tipo_identificacion,
      cedula: cliente.cedula,
    });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => setOpenEditModal(false);

  const handleOpenPlacasModal = (cliente) => {
    if (cliente.cedula) {
      setCurrentCedulaCliente(cliente.cedula);
      fetchPlacasByCliente(cliente.cedula);
      setNewPlaca({ numero: "", cedula_cliente: cliente.cedula });
      setOpenPlacasModal(true);
    } else {
      console.error("La cédula del cliente no está definida");
    }
  };

  const handleClosePlacasModal = () => setOpenPlacasModal(false);

  const handleChange = (e) => {
    setNewCliente({ ...newCliente, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditCliente({ ...editCliente, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.apiUrl}/cliente`, newCliente, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchClientes();
      handleCloseAddModal();
      setNewCliente({
        nombre: "",
        apellido: "",
        correo: "",
        direccion: "",
        telefono: "",
        tipo_identificacion: "C",
        cedula: "",
      });
    } catch (error) {
      console.error("Error al crear cliente", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${config.apiUrl}/cliente/${editCliente.cedula}`,
        editCliente,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchClientes();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error al actualizar cliente", error);
    }
  };

  const handleDelete = async (cliente) => {
    try {
      await axios.delete(`${config.apiUrl}/cliente/${cliente.cedula}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchClientes();
    } catch (error) {
      console.error("Error al eliminar cliente", error);
    }
  };

  const handlePlacaSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.apiUrl}/placa`, newPlaca, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPlacasByCliente(newPlaca.cedula_cliente);
      setNewPlaca({ numero: "", cedula_cliente: newPlaca.cedula_cliente });
    } catch (error) {
      console.error("Error al crear placa", error);
    }
  };

  const handleDeletePlaca = async (id) => {
    try {
      await axios.delete(`${config.apiUrl}/placa/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPlacasByCliente(currentCedulaCliente);
    } catch (error) {
      console.error("Error al eliminar placa", error);
    }
  };

  return (
    <div>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontFamily: "Poppins, sans-serif", color: "#2e7d32" }}
      >
        CRUD de Clientes
      </Typography>

      {/* Búsqueda por cédula */}
      <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
          label="Buscar por Cédula"
          value={searchCedula}
          onChange={(e) => setSearchCedula(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ fontFamily: "Poppins, sans-serif" }}
        />
        <Button
          variant="contained"
          onClick={handleSearchByCedula}
          sx={{
            ml: 2,
            backgroundColor: "#4caf50",
            color: "white",
            "&:hover": { backgroundColor: "#388e3c" },
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Buscar
        </Button>
      </Box>

      {/* Búsqueda por placa */}
      <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
          label="Buscar por Placa"
          value={searchPlaca}
          onChange={(e) => setSearchPlaca(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ fontFamily: "Poppins, sans-serif" }}
        />
        <Button
          variant="contained"
          onClick={handleSearchByPlaca}
          sx={{
            ml: 2,
            backgroundColor: "#4caf50",
            color: "white",
            "&:hover": { backgroundColor: "#388e3c" },
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Buscar
        </Button>
      </Box>

      <Fab
        color="success"
        aria-label="add"
        onClick={handleOpenAddModal}
        sx={{ marginBottom: "20px", backgroundColor: "#72a7fc", color: "white" }}
      >
        <AddIcon />
      </Fab>

      <CrudTable
        columns={[
          { title: "Cédula", field: "cedula" },
          { title: "Nombre", field: "nombre" },
          { title: "Apellido", field: "apellido" },
          { title: "Correo", field: "correo" },
          { title: "Dirección", field: "direccion" },
          { title: "Teléfono", field: "telefono" },
          { title: "Tipo de Identificación", field: "tipo_identificacion" },
        ]}
        data={filteredClientes}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
        actions={[
          {
            icon: () => <LocalParkingIcon />,
            tooltip: "Gestionar Placas",
            onClick: (event, rowData) => handleOpenPlacasModal(rowData),
          },
        ]}
      />

      {/* Modal para agregar nuevo cliente */}
      <Modal open={openAddModal} onClose={handleCloseAddModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleSubmit}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontFamily: "Poppins, sans-serif", color: "#388e3c" }}
          >
            Agregar Nuevo Cliente
          </Typography>

          <TextField
            label="Nombre"
            name="nombre"
            fullWidth
            value={newCliente.nombre}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            label="Apellido"
            name="apellido"
            fullWidth
            value={newCliente.apellido}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            label="Cédula"
            name="cedula"
            fullWidth
            value={newCliente.cedula}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            label="Correo"
            name="correo"
            fullWidth
            value={newCliente.correo}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            label="Dirección"
            name="direccion"
            fullWidth
            value={newCliente.direccion}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            label="Teléfono"
            name="telefono"
            fullWidth
            value={newCliente.telefono}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            select
            label="Tipo de Identificación"
            name="tipo_identificacion"
            fullWidth
            value={newCliente.tipo_identificacion}
            onChange={handleChange}
            margin="normal"
            required
          >
            <MenuItem value="C">Cédula</MenuItem>
            <MenuItem value="P">Pasaporte</MenuItem>
            <MenuItem value="R">RUC</MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#4caf50",
              color: "white",
              "&:hover": { backgroundColor: "#388e3c" },
              fontFamily: "Poppins, sans-serif",
            }}
            fullWidth
          >
            Agregar
          </Button>
        </Box>
      </Modal>

      {/* Modal para editar cliente */}
      <Modal open={openEditModal} onClose={handleCloseEditModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleEditSubmit}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontFamily: "Poppins, sans-serif", color: "#388e3c" }}
          >
            Editar Cliente
          </Typography>

          <TextField
            label="Nombre"
            name="nombre"
            fullWidth
            value={editCliente.nombre}
            onChange={handleEditChange}
            margin="normal"
            required
          />
          <TextField
            label="Apellido"
            name="apellido"
            fullWidth
            value={editCliente.apellido}
            onChange={handleEditChange}
            margin="normal"
            required
          />
          <TextField
            label="Cédula"
            name="cedula"
            fullWidth
            value={editCliente.cedula}
            onChange={handleEditChange}
            margin="normal"
            required
          />
          <TextField
            label="Correo"
            name="correo"
            fullWidth
            value={editCliente.correo}
            onChange={handleEditChange}
            margin="normal"
            required
          />
          <TextField
            label="Dirección"
            name="direccion"
            fullWidth
            value={editCliente.direccion}
            onChange={handleEditChange}
            margin="normal"
            required
          />
          <TextField
            label="Teléfono"
            name="telefono"
            fullWidth
            value={editCliente.telefono}
            onChange={handleEditChange}
            margin="normal"
            required
          />
          <TextField
            select
            label="Tipo de Identificación"
            name="tipo_identificacion"
            fullWidth
            value={editCliente.tipo_identificacion}
            onChange={handleEditChange}
            margin="normal"
            required
          >
            <MenuItem value="C">Cédula</MenuItem>
            <MenuItem value="P">Pasaporte</MenuItem>
            <MenuItem value="R">RUC</MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#4caf50",
              color: "white",
              "&:hover": { backgroundColor: "#388e3c" },
              fontFamily: "Poppins, sans-serif",
            }}
            fullWidth
          >
            Guardar Cambios
          </Button>
        </Box>
      </Modal>

      {/* Modal para gestionar placas */}
      <Modal open={openPlacasModal} onClose={handleClosePlacasModal} aria-labelledby="modal-placas-title">
        <Box sx={style} component="form" onSubmit={handlePlacaSubmit}>
          <Typography
            id="modal-placas-title"
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontFamily: "Poppins, sans-serif", color: "#388e3c" }}
          >
            Gestionar Placas del cliente con cédula {currentCedulaCliente}
          </Typography>

          {placas.length > 0 ? (
            placas.map((placa) => (
              <Box key={placa.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body1" sx={{ fontFamily: "Poppins, sans-serif" }}>Placa: {placa.numero}</Typography>
                <IconButton onClick={() => handleDeletePlaca(placa.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "Poppins, sans-serif" }}>
              No hay placas asociadas a este cliente.
            </Typography>
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

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#4caf50",
              color: "white",
              "&:hover": { backgroundColor: "#388e3c" },
              fontFamily: "Poppins, sans-serif",
            }}
            fullWidth
          >
            Agregar Placa
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default ClientesCrud;
