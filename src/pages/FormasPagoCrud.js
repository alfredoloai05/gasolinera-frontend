import React, { useState, useEffect } from "react";
import {
  Fab,
  Modal,
  Box,
  TextField,
  Button,
  Typography,
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
  border: "2px solid #4caf50", 
  boxShadow: 24,
  p: 4,
  fontFamily: "Poppins, sans-serif", 
};

function FormasPagoCrud() {
  const [formasPago, setFormasPago] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false); 
  const [openEditModal, setOpenEditModal] = useState(false);
  const [newFormaPago, setNewFormaPago] = useState({
    tipo: "",
  });
  const [editFormaPago, setEditFormaPago] = useState({
    id: "",
    tipo: "",
  });

  // Obtener la lista de formas de pago
  const fetchFormasPago = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/formapagos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFormasPago(response.data);
    } catch (error) {
      console.error("Error al cargar formas de pago", error);
    }
  };

  useEffect(() => {
    fetchFormasPago();
  }, []);

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);
  const handleOpenEditModal = (formapago) => {
    setEditFormaPago({
      id: formapago.id,
      tipo: formapago.tipo,
    });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => setOpenEditModal(false);

  const handleChange = (e) => {
    setNewFormaPago({ ...newFormaPago, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormaPago({ ...editFormaPago, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.apiUrl}/formapago`, newFormaPago, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchFormasPago();
      handleCloseAddModal();
      setNewFormaPago({ tipo: "" });
    } catch (error) {
      console.error("Error al crear forma de pago", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.apiUrl}/formapago/${editFormaPago.id}`, editFormaPago, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchFormasPago();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error al actualizar forma de pago", error);
    }
  };

  const handleDelete = async (formapago) => {
    try {
      await axios.delete(`${config.apiUrl}/formapago/${formapago.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchFormasPago();
    } catch (error) {
      console.error("Error al eliminar forma de pago", error);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "Poppins, sans-serif", color: "#4caf50" }}>CRUD de Formas de Pago</h2>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenAddModal}
        style={{ marginBottom: "20px", backgroundColor: "#72a7fc" }}
      >
        <AddIcon />
      </Fab>

      <CrudTable
        columns={[{ title: "Tipo de Forma de Pago", field: "tipo" }]}
        data={formasPago}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      {/* Modal para agregar nueva forma de pago */}
      <Modal open={openAddModal} onClose={handleCloseAddModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleSubmit}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom sx={{ fontFamily: "Poppins, sans-serif" }}>
            Agregar Nueva Forma de Pago
          </Typography>

          <TextField
            label="Tipo de Forma de Pago"
            name="tipo"
            fullWidth
            value={newFormaPago.tipo}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontFamily: "Poppins, sans-serif", backgroundColor: "#4caf50" }}
          >
            Agregar
          </Button>
        </Box>
      </Modal>

      {/* Modal para editar forma de pago */}
      <Modal open={openEditModal} onClose={handleCloseEditModal} aria-labelledby="modal-modal-title">
        <Box sx={style} component="form" onSubmit={handleEditSubmit}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom sx={{ fontFamily: "Poppins, sans-serif" }}>
            Editar Forma de Pago
          </Typography>

          <TextField
            label="Tipo de Forma de Pago"
            name="tipo"
            fullWidth
            value={editFormaPago.tipo}
            onChange={handleEditChange}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontFamily: "Poppins, sans-serif", backgroundColor: "#4caf50" }}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default FormasPagoCrud;
