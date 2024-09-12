import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import Escaner from "./Detector"; // Importar el escáner

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

function VentaPlaca() {
  const [placa, setPlaca] = useState("");
  const [cliente, setCliente] = useState(null);
  const [newCliente, setNewCliente] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
  });
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showAssignPlacaDialog, setShowAssignPlacaDialog] = useState(false);

  // Función para manejar cuando la placa es detectada
  const handlePlacaDetectada = (placaDetectada) => {
    setPlaca(placaDetectada);
    buscarPlaca(placaDetectada);
  };

  // Buscar cliente por número de placa
  const buscarPlaca = async (placa) => {
    try {
      const response = await axios.get(`http://localhost:5000/placa/${placa}/cliente`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCliente(response.data); // Mostrar los datos del cliente si la placa existe
      setShowNewClientForm(false); // Ocultar el formulario de nuevo cliente
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Si no existe, mostrar el formulario para crear un nuevo cliente
        setShowNewClientForm(true);
        setCliente(null);
      } else {
        console.error("Error al buscar la placa", error);
      }
    }
  };

  // Crear un nuevo cliente
  const crearCliente = async () => {
    try {
      await axios.post("http://localhost:5000/cliente", newCliente, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Una vez creado, preguntar si desea asociar la placa al cliente
      setShowAssignPlacaDialog(true);
    } catch (error) {
      console.error("Error al crear cliente", error);
    }
  };

  // Asignar la placa al nuevo cliente
  const asignarPlaca = async () => {
    try {
      await axios.post("http://localhost:5000/placa", {
        numero: placa,
        cedula_cliente: newCliente.cedula,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Placa asignada exitosamente");
      setShowAssignPlacaDialog(false);
      setShowNewClientForm(false);
    } catch (error) {
      console.error("Error al asignar la placa", error);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Buscar por Placa</Typography>
      
      {/* Escaner de Placa */}
      <Escaner onPlacaDetectada={handlePlacaDetectada} />

      <TextField
        label="Número de Placa"
        value={placa}
        onChange={(e) => setPlaca(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={() => buscarPlaca(placa)}>
        Buscar
      </Button>

      {/* Mostrar cliente si existe */}
      {cliente && (
        <Box mt={3}>
          <Typography variant="h6">Datos del Cliente</Typography>
          <Typography>Nombre: {cliente.nombre}</Typography>
          <Typography>Apellido: {cliente.apellido}</Typography>
          <Typography>Cédula: {cliente.cedula}</Typography>
          <Typography>Correo: {cliente.correo}</Typography>
          <Typography>Dirección: {cliente.direccion}</Typography>
        </Box>
      )}

      {/* Formulario para crear nuevo cliente si la placa no existe */}
      {showNewClientForm && (
        <Box mt={3}>
          <Typography variant="h6">Crear Nuevo Cliente</Typography>
          <TextField
            label="Cédula"
            name="cedula"
            fullWidth
            value={newCliente.cedula}
            onChange={(e) => setNewCliente({ ...newCliente, cedula: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            label="Nombre"
            name="nombre"
            fullWidth
            value={newCliente.nombre}
            onChange={(e) => setNewCliente({ ...newCliente, nombre: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            label="Apellido"
            name="apellido"
            fullWidth
            value={newCliente.apellido}
            onChange={(e) => setNewCliente({ ...newCliente, apellido: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            label="Correo"
            name="correo"
            fullWidth
            value={newCliente.correo}
            onChange={(e) => setNewCliente({ ...newCliente, correo: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            label="Dirección"
            name="direccion"
            fullWidth
            value={newCliente.direccion}
            onChange={(e) => setNewCliente({ ...newCliente, direccion: e.target.value })}
            margin="normal"
            required
          />
          <Button variant="contained" color="primary" onClick={crearCliente}>
            Crear Cliente
          </Button>
        </Box>
      )}

      {/* Diálogo para confirmar si se desea asignar la placa al nuevo cliente */}
      <Dialog open={showAssignPlacaDialog} onClose={() => setShowAssignPlacaDialog(false)}>
        <DialogTitle>Asignar Placa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Deseas asignar la placa {placa} al nuevo cliente {newCliente.nombre} {newCliente.apellido}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssignPlacaDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={asignarPlaca} color="primary" autoFocus>
            Asignar Placa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VentaPlaca;
