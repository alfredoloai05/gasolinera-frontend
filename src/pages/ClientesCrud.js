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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalParkingIcon from "@mui/icons-material/LocalParking"; 
import CrudTable from "../components/CrudTable";
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

function ClientesCrud() {
  const [clientes, setClientes] = useState([]);
  const [placas, setPlacas] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]); // Para almacenar el resultado de búsqueda
  const [openAddModal, setOpenAddModal] = useState(false); 
  const [openEditModal, setOpenEditModal] = useState(false); 
  const [openPlacasModal, setOpenPlacasModal] = useState(false); 
  const [currentCedulaCliente, setCurrentCedulaCliente] = useState(""); 
  const [searchCedula, setSearchCedula] = useState(""); // Valor de búsqueda por cédula
  const [searchPlaca, setSearchPlaca] = useState(""); // Valor de búsqueda por placa

  const [newCliente, setNewCliente] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
    cedula: "",
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

  const fetchClientes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/clientes", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClientes(response.data);
      setFilteredClientes(response.data); // Mostrar todos inicialmente
    } catch (error) {
      console.error("Error al cargar clientes", error);
    }
  };

  const fetchPlacasByCliente = async (cedula) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/cliente/${cedula}/placas`,
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

  const handleSearchByCedula = async () => {
    if (searchCedula.trim() !== "") {
      try {
        const response = await axios.get(
          `http://localhost:5000/cliente/cedula/${searchCedula}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setFilteredClientes([response.data]); // Mostrar solo el cliente encontrado
      } catch (error) {
        console.error("Error al buscar cliente por cédula", error);
      }
    } else {
      setFilteredClientes(clientes); // Mostrar todos si no hay búsqueda
    }
  };

  const handleSearchByPlaca = async () => {
    if (searchPlaca.trim() !== "") {
      try {
        const response = await axios.get(
          `http://localhost:5000/placa/${searchPlaca}/cliente`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setFilteredClientes([response.data]); // Mostrar solo el cliente asociado a la placa
      } catch (error) {
        console.error("Error al buscar cliente por placa", error);
      }
    } else {
      setFilteredClientes(clientes); // Mostrar todos si no hay búsqueda
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
      await axios.post("http://localhost:5000/cliente", newCliente, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchClientes();
      handleCloseAddModal();
      setNewCliente({
        nombre: "",
        apellido: "",
        correo: "",
        direccion: "",
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
        `http://localhost:5000/cliente/${editCliente.cedula}`,
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
      await axios.delete(`http://localhost:5000/cliente/${cliente.cedula}`, {
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
      await axios.post("http://localhost:5000/placa", newPlaca, {
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
      await axios.delete(`http://localhost:5000/placa/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPlacasByCliente(currentCedulaCliente); 
    } catch (error) {
      console.error("Error al eliminar placa", error);
    }
  };

  return (
    <div>
      <h2>CRUD de Clientes</h2>

      {/* Búsqueda por cédula */}
      <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
          label="Buscar por Cédula"
          value={searchCedula}
          onChange={(e) => setSearchCedula(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" onClick={handleSearchByCedula} sx={{ ml: 2 }}>
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
        />
        <Button variant="contained" onClick={handleSearchByPlaca} sx={{ ml: 2 }}>
          Buscar
        </Button>
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenAddModal}
        style={{ marginBottom: "20px" }}
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
        ]}
        data={filteredClientes}  // Se muestra el resultado filtrado
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
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Agregar
          </Button>
        </Box>
      </Modal>

      {/* Modal para editar cliente */}
      <Modal open={openEditModal} onClose={handleCloseEditModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleEditSubmit}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Modal>

      {/* Modal para gestionar placas */}
      <Modal open={openPlacasModal} onClose={handleClosePlacasModal} aria-labelledby="modal-placas-title">
        <Box sx={style} component="form" onSubmit={handlePlacaSubmit}>
          <Typography id="modal-placas-title" variant="h6" component="h2" gutterBottom>
            Gestionar Placas del cliente con cédula {currentCedulaCliente}
          </Typography>

          {placas.length > 0 ? (
            placas.map((placa) => (
              <Box key={placa.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body1">Placa: {placa.numero}</Typography>
                <IconButton onClick={() => handleDeletePlaca(placa.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
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
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Agregar Placa
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default ClientesCrud;
