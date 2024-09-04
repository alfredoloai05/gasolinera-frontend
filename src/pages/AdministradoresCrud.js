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

function AdministradoresCrud() {
  const [administradores, setAdministradores] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false); // Modal para agregar
  const [openEditModal, setOpenEditModal] = useState(false); // Modal para editar
  const [openPasswordModal, setOpenPasswordModal] = useState(false); // Modal para cambiar contraseña
  const [newAdmin, setNewAdmin] = useState({
    nombre: "",
    apellido: "",
    usuario: "",
    correo: "",
    clave: "",
    cedula: "",
  });
  const [editAdmin, setEditAdmin] = useState({
    id: "",
    nombre: "",
    apellido: "",
    usuario: "",
    correo: "",
    cedula: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchAdministradores = async () => {
    try {
      const response = await axios.get("http://localhost:5000/administradores", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAdministradores(response.data);
    } catch (error) {
      console.error("Error al cargar administradores", error);
    }
  };

  useEffect(() => {
    fetchAdministradores();
  }, []);

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);
  const handleOpenEditModal = (admin) => {
    setEditAdmin({
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      usuario: admin.usuario,
      correo: admin.correo,
      cedula: admin.cedula,
    });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => setOpenEditModal(false);
  const handleOpenPasswordModal = () => setOpenPasswordModal(true);
  const handleClosePasswordModal = () => setOpenPasswordModal(false);

  const handleChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditAdmin({ ...editAdmin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/administrador", newAdmin, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchAdministradores();
      handleCloseAddModal();
      setNewAdmin({
        nombre: "",
        apellido: "",
        usuario: "",
        correo: "",
        clave: "",
        cedula: "",
      });
    } catch (error) {
      console.error("Error al crear administrador", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/administrador/${editAdmin.id}`, editAdmin, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchAdministradores();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error al actualizar administrador", error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/administrador/${editAdmin.id}`, { clave: newPassword }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      handleClosePasswordModal();
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error al cambiar contraseña", error);
    }
  };

  const handleDelete = async (admin) => {
    try {
      await axios.delete(`http://localhost:5000/administrador/${admin.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchAdministradores();
    } catch (error) {
      console.error("Error al eliminar administrador", error);
    }
  };

  return (
    <div>
      <h2>CRUD de Administradores</h2>

      <Fab color="primary" aria-label="add" onClick={handleOpenAddModal} style={{ marginBottom: "20px" }}>
        <AddIcon />
      </Fab>

      <CrudTable
        columns={[
          { title: "Nombre", field: "nombre" },
          { title: "Apellido", field: "apellido" },
          { title: "Usuario", field: "usuario" },
          { title: "Correo", field: "correo" },
        ]}
        data={administradores}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      {/* Modal para agregar nuevo administrador */}
      <Modal open={openAddModal} onClose={handleCloseAddModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleSubmit}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            Agregar Nuevo Administrador
          </Typography>

          <TextField label="Nombre" name="nombre" fullWidth value={newAdmin.nombre} onChange={handleChange} margin="normal" required />
          <TextField label="Apellido" name="apellido" fullWidth value={newAdmin.apellido} onChange={handleChange} margin="normal" required />
          <TextField label="Cédula" name="cedula" fullWidth value={newAdmin.cedula} onChange={handleChange} margin="normal" required />
          <TextField label="Usuario" name="usuario" fullWidth value={newAdmin.usuario} onChange={handleChange} margin="normal" required />
          <TextField label="Correo" name="correo" fullWidth value={newAdmin.correo} onChange={handleChange} margin="normal" required />
          <TextField label="Clave" name="clave" type="password" fullWidth value={newAdmin.clave} onChange={handleChange} margin="normal" required />

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Agregar
          </Button>
        </Box>
      </Modal>

      {/* Modal para editar administrador */}
      <Modal open={openEditModal} onClose={handleCloseEditModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleEditSubmit}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            Editar Administrador
          </Typography>

          <TextField label="Nombre" name="nombre" fullWidth value={editAdmin.nombre} onChange={handleEditChange} margin="normal" required />
          <TextField label="Apellido" name="apellido" fullWidth value={editAdmin.apellido} onChange={handleEditChange} margin="normal" required />
          <TextField label="Cédula" name="cedula" fullWidth value={editAdmin.cedula} onChange={handleEditChange} margin="normal" required />
          <TextField label="Usuario" name="usuario" fullWidth value={editAdmin.usuario} onChange={handleEditChange} margin="normal" required />
          <TextField label="Correo" name="correo" fullWidth value={editAdmin.correo} onChange={handleEditChange} margin="normal" required />
          
          <TextField label="Clave" value="*******" margin="normal" fullWidth disabled />
          <Button onClick={handleOpenPasswordModal} variant="outlined" color="secondary" fullWidth sx={{ mt: 2 }}>
            Cambiar Clave
          </Button>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Guardar Cambios
          </Button>
        </Box>
      </Modal>

      {/* Modal para cambiar la contraseña */}
      <Modal open={openPasswordModal} onClose={handleClosePasswordModal} aria-labelledby="modal-password-title">
        <Box sx={style} component="form" onSubmit={handlePasswordSubmit}>
          <Typography id="modal-password-title" variant="h6" component="h2" gutterBottom>
            Cambiar Contraseña
          </Typography>

          <TextField label="Nueva Contraseña" name="newPassword" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} margin="normal" required />
          <TextField label="Confirmar Contraseña" name="confirmPassword" type="password" fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} margin="normal" required />

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Actualizar Contraseña
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default AdministradoresCrud;
