import React, { useState, useEffect } from "react";
import {
  Fab,
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  IconButton,
  Tooltip,
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

function PerchasCrud() {
  const [perchas, setPerchas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [newPercha, setNewPercha] = useState({ nombre: "", id_grupo: "" });
  const [editPercha, setEditPercha] = useState({});
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Obtener la lista de perchas
  const fetchPerchas = async () => {
    try {
      const response = await axios.get("http://localhost:5000/perchas", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPerchas(response.data);
    } catch (error) {
      console.error("Error al cargar perchas", error);
    }
  };

  // Obtener la lista de grupos disponibles
  const fetchGrupos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/grupos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGrupos(response.data);
    } catch (error) {
      console.error("Error al cargar grupos", error);
    }
  };

  useEffect(() => {
    fetchPerchas();
    fetchGrupos();
  }, []);

  // Abrir y cerrar el modal de agregar
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Abrir y cerrar el modal de editar
  const handleOpenEditModal = (percha) => {
    setEditPercha(percha);
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => setOpenEditModal(false);

  // Manejar cambios en el formulario de agregar o editar
  const handleChange = (setter) => (e) => setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Función para enviar el formulario de crear una nueva percha
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/percha", newPercha, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPerchas();
      handleCloseAddModal();
      setNewPercha({ nombre: "", id_grupo: "" });
    } catch (error) {
      console.error("Error al crear percha", error);
    }
  };

  // Función para enviar el formulario de editar una percha
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/percha/${editPercha.id}`, editPercha, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPerchas();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error al actualizar percha", error);
    }
  };

  // Función para eliminar una percha
  const handleDelete = async (percha) => {
    try {
      await axios.delete(`http://localhost:5000/percha/${percha.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPerchas();
    } catch (error) {
      console.error("Error al eliminar percha", error);
    }
  };

  return (
    <div>
      <h2>CRUD de Perchas</h2>

      {/* Botón para abrir el modal de agregar */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenAddModal}
        style={{ marginBottom: "20px" }}
      >
        <AddIcon />
      </Fab>

      {/* Tabla de perchas */}
      <CrudTable
        columns={[
          { title: "Nombre de la Percha", field: "nombre" },
          {
            title: "Grupo Asignado",
            field: "grupo",
            render: (rowData) => (rowData.grupo ? rowData.grupo.nombre : "Sin Grupo"),
          },
        ]}
        data={perchas}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      {/* Modal para agregar una nueva percha */}
      <Modal open={openAddModal} onClose={handleCloseAddModal}>
        <Box sx={style} component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" component="h2" gutterBottom>
            Agregar Nueva Percha
          </Typography>

          <TextField
            label="Nombre de la Percha"
            name="nombre"
            fullWidth
            value={newPercha.nombre}
            onChange={handleChange(setNewPercha)}
            margin="normal"
            required
          />

          <TextField
            select
            label="Grupo Asignado"
            name="id_grupo"
            fullWidth
            value={newPercha.id_grupo}
            onChange={handleChange(setNewPercha)}
            margin="normal"
            required
          >
            {grupos.map((grupo) => (
              <MenuItem key={grupo.id} value={grupo.id}>
                {grupo.nombre}
              </MenuItem>
            ))}
          </TextField>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Agregar
          </Button>
        </Box>
      </Modal>

      {/* Modal para editar una percha */}
      <Modal open={openEditModal} onClose={handleCloseEditModal}>
        <Box sx={style} component="form" onSubmit={handleEditSubmit}>
          <Typography variant="h6" component="h2" gutterBottom>
            Editar Percha
          </Typography>

          <TextField
            label="Nombre de la Percha"
            name="nombre"
            fullWidth
            value={editPercha.nombre || ""}
            onChange={handleChange(setEditPercha)}
            margin="normal"
            required
          />

          <TextField
            select
            label="Grupo Asignado"
            name="id_grupo"
            fullWidth
            value={editPercha.id_grupo || ""}
            onChange={handleChange(setEditPercha)}
            margin="normal"
            required
          >
            {grupos.map((grupo) => (
              <MenuItem key={grupo.id} value={grupo.id}>
                {grupo.nombre}
              </MenuItem>
            ))}
          </TextField>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Guardar Cambios
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default PerchasCrud;
