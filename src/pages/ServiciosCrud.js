import React, { useState, useEffect } from "react";
import {
  Fab,
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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

function ServiciosCrud() {
  const [servicios, setServicios] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false); // Modal para agregar
  const [openEditModal, setOpenEditModal] = useState(false); // Modal para editar
  const [newServicio, setNewServicio] = useState({
    tipo: "",
  });
  const [editServicio, setEditServicio] = useState({
    id: "",
    tipo: "",
  });

  // Obtener la lista de servicios
  const fetchServicios = async () => {
    try {
      const response = await axios.get("http://localhost:5000/servicios", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setServicios(response.data);
    } catch (error) {
      console.error("Error al cargar servicios", error);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);
  const handleOpenEditModal = (servicio) => {
    setEditServicio({
      id: servicio.id,
      tipo: servicio.tipo,
    });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => setOpenEditModal(false);

  const handleChange = (e) => {
    setNewServicio({ ...newServicio, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditServicio({ ...editServicio, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/servicio", newServicio, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchServicios();
      handleCloseAddModal();
      setNewServicio({ tipo: "" });
    } catch (error) {
      console.error("Error al crear servicio", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/servicio/${editServicio.id}`, editServicio, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchServicios();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error al actualizar servicio", error);
    }
  };

  const handleDelete = async (servicio) => {
    try {
      await axios.delete(`http://localhost:5000/servicio/${servicio.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchServicios();
    } catch (error) {
      console.error("Error al eliminar servicio", error);
    }
  };

  return (
    <div>
      <h2>CRUD de Servicios</h2>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenAddModal}
        style={{ marginBottom: "20px" }}
      >
        <AddIcon />
      </Fab>

      <CrudTable
        columns={[{ title: "Tipo de Servicio", field: "tipo" }]}
        data={servicios}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      {/* Modal para agregar nuevo servicio */}
      <Modal open={openAddModal} onClose={handleCloseAddModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleSubmit}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            Agregar Nuevo Servicio
          </Typography>

          <TextField
            label="Tipo de Servicio"
            name="tipo"
            fullWidth
            value={newServicio.tipo}
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

      {/* Modal para editar servicio */}
      <Modal open={openEditModal} onClose={handleCloseEditModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleEditSubmit}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            Editar Servicio
          </Typography>

          <TextField
            label="Tipo de Servicio"
            name="tipo"
            fullWidth
            value={editServicio.tipo}
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
    </div>
  );
}

export default ServiciosCrud;
