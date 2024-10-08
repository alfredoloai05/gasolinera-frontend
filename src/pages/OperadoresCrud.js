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

function OperadoresCrud() {
  const [operadores, setOperadores] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [newOperador, setNewOperador] = useState({
    nombre: "",
    apellido: "",
    usuario: "",
    correo: "",
    clave: "",
    cedula: "",
  });
  const [editOperador, setEditOperador] = useState({
    id: "",
    nombre: "",
    apellido: "",
    usuario: "",
    correo: "",
    cedula: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchOperadores = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/operadores`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOperadores(response.data);
    } catch (error) {
      console.error("Error al cargar operadores", error);
    }
  };

  useEffect(() => {
    fetchOperadores();
  }, []);

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);
  const handleOpenEditModal = (operador) => {
    setEditOperador({
      id: operador.id,
      nombre: operador.nombre,
      apellido: operador.apellido,
      usuario: operador.usuario,
      correo: operador.correo,
      cedula: operador.cedula,
    });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => setOpenEditModal(false);
  const handleOpenPasswordModal = () => setOpenPasswordModal(true);
  const handleClosePasswordModal = () => setOpenPasswordModal(false);

  const handleChange = (e) => {
    setNewOperador({ ...newOperador, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditOperador({ ...editOperador, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.apiUrl}/operador`, newOperador, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchOperadores();
      handleCloseAddModal();
      setNewOperador({
        nombre: "",
        apellido: "",
        usuario: "",
        correo: "",
        clave: "",
        cedula: "",
      });
    } catch (error) {
      console.error("Error al crear operador", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.apiUrl}/operador/${editOperador.id}`, editOperador, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchOperadores();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error al actualizar operador", error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      await axios.put(`${config.apiUrl}/operador/${editOperador.id}`, { clave: newPassword }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      handleClosePasswordModal();
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error al cambiar contraseña", error);
    }
  };

  const handleDelete = async (operador) => {
    try {
      await axios.delete(`${config.apiUrl}/operador/${operador.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchOperadores();
    } catch (error) {
      console.error("Error al eliminar operador", error);
    }
  };

  return (
    <div>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontFamily: "Poppins, sans-serif", color: "#2e7d32" }}
      >
        CRUD de Operadores
      </Typography>

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
          { title: "Nombre", field: "nombre" },
          { title: "Apellido", field: "apellido" },
          { title: "Usuario", field: "usuario" },
          { title: "Correo", field: "correo" },
        ]}
        data={operadores}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      {/* Modal para agregar nuevo operador */}
      <Modal open={openAddModal} onClose={handleCloseAddModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleSubmit}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontFamily: "Poppins, sans-serif", color: "#388e3c" }}
          >
            Agregar Nuevo Operador
          </Typography>

          <TextField label="Nombre" name="nombre" fullWidth value={newOperador.nombre} onChange={handleChange} margin="normal" required />
          <TextField label="Apellido" name="apellido" fullWidth value={newOperador.apellido} onChange={handleChange} margin="normal" required />
          <TextField label="Cédula" name="cedula" fullWidth value={newOperador.cedula} onChange={handleChange} margin="normal" required />
          <TextField label="Usuario" name="usuario" fullWidth value={newOperador.usuario} onChange={handleChange} margin="normal" required />
          <TextField label="Correo" name="correo" fullWidth value={newOperador.correo} onChange={handleChange} margin="normal" required />
          <TextField label="Clave" name="clave" type="password" fullWidth value={newOperador.clave} onChange={handleChange} margin="normal" required />

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

      {/* Modal para editar operador */}
      <Modal open={openEditModal} onClose={handleCloseEditModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleEditSubmit}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontFamily: "Poppins, sans-serif", color: "#388e3c" }}
          >
            Editar Operador
          </Typography>

          <TextField label="Nombre" name="nombre" fullWidth value={editOperador.nombre} onChange={handleEditChange} margin="normal" required />
          <TextField label="Apellido" name="apellido" fullWidth value={editOperador.apellido} onChange={handleEditChange} margin="normal" required />
          <TextField label="Cédula" name="cedula" fullWidth value={editOperador.cedula} onChange={handleEditChange} margin="normal" required />
          <TextField label="Usuario" name="usuario" fullWidth value={editOperador.usuario} onChange={handleEditChange} margin="normal" required />
          <TextField label="Correo" name="correo" fullWidth value={editOperador.correo} onChange={handleEditChange} margin="normal" required />

          <TextField label="Clave" value="*******" margin="normal" fullWidth disabled />
          <Button onClick={handleOpenPasswordModal} variant="outlined" color="secondary" fullWidth sx={{ mt: 2 }}>
            Cambiar Clave
          </Button>

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

      {/* Modal para cambiar la contraseña */}
      <Modal open={openPasswordModal} onClose={handleClosePasswordModal} aria-labelledby="modal-password-title">
        <Box sx={style} component="form" onSubmit={handlePasswordSubmit}>
          <Typography
            id="modal-password-title"
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontFamily: "Poppins, sans-serif", color: "#388e3c" }}
          >
            Cambiar Contraseña
          </Typography>

          <TextField label="Nueva Contraseña" name="newPassword" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} margin="normal" required />
          <TextField label="Confirmar Contraseña" name="confirmPassword" type="password" fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} margin="normal" required />

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
            Actualizar Contraseña
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default OperadoresCrud;
