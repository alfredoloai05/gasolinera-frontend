import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import config from '../config';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
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
    telefono: "",
    tipo_identificacion: "C",
    cedula: cedulaBuscar,
    NumeroCuantia: "",
    NumeroCuantiaChecked: false,
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

  const limpiarCampos = () => {
    setCedulaBuscar("");
    setCliente(null);
    setPlacas([]);
    setNewCliente({
      nombre: "",
      apellido: "",
      correo: "",
      direccion: "",
      telefono: "",
      tipo_identificacion: "C",
      cedula: "",
    });
    setNewPlaca({
      numero: "",
      cedula_cliente: "",
    });
  };

  useEffect(() => {
    if (onLimpiar) {
      onLimpiar(limpiarCampos);
    }
  }, [onLimpiar]);

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

  const buscarClientePorCedula = async (cedula) => {
    try {
      const response = await axios.get(`${config.apiUrl}/cliente/cedula/${cedula}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCliente(response.data);
      const placasCliente = await fetchPlacasByCliente(response.data.cedula);
      
      onClienteEncontrado({ 
        ...response.data, 
        placas: placasCliente, 
        NumeroCuantia: response.data.NumeroCuantia || "", 
        NumeroCuantiaChecked: !!response.data.NumeroCuantia 
      });
  
      if (placasCliente.length === 0) {
        handleOpenPlacasModal(response.data);
      }
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setCliente(null);
        handleOpenAddModal();
      } else {
        console.error("Error al buscar cliente", error);
      }
    }
  };
  
  const fetchPlacasByCliente = async (cedula) => {
    try {
      const response = await axios.get(`${config.apiUrl}/cliente/${cedula}/placas`, {
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

  const handleAddClienteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.apiUrl}/cliente`, newCliente, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCliente(response.data);
      handleCloseAddModal();
      handleOpenPlacasModal(response.data);
    } catch (error) {
      console.error("Error al crear cliente", error);
    }
  };

  const handlePlacaSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.apiUrl}/placa`, newPlaca, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchPlacasByCliente(newPlaca.cedula_cliente);
      handleClosePlacasModal();
    } catch (error) {
      console.error("Error al crear placa", error);
    }
  };

  return (
    <div>
      <Typography variant="h5" sx={{ fontFamily: "Poppins, sans-serif", fontWeight: 'bold', color: '#2e7d32' }}>
        Buscar Cliente por Cédula
      </Typography>
      <Box sx={{ display: "flex", mb: 2, gap: 2 }}>
        <TextField
          label="Cédula"
          value={cedulaBuscar}
          onChange={(e) => setCedulaBuscar(e.target.value)}
          fullWidth
          margin="normal"
          sx={{ backgroundColor: 'white', borderRadius: 1 }}
        />
        <Tooltip title="Buscar Cliente">
          <IconButton onClick={() => buscarClientePorCedula(cedulaBuscar)}>
            <SearchIcon sx={{ color: '#4caf50' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {cliente ? (
        <div>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
            {cliente.nombre} {cliente.apellido}
          </Typography>
          <Typography variant="body1">Cédula: {cliente.cedula}</Typography>
          <Typography variant="body1">Correo: {cliente.correo}</Typography>
          <Typography variant="body1">Dirección: {cliente.direccion}</Typography>
          <Typography variant="body1">Teléfono: {cliente.telefono}</Typography>
          <Typography variant="body1">Tipo de Identificación: {cliente.tipo_identificacion}</Typography>
          <IconButton onClick={() => handleOpenPlacasModal(cliente)}>
            <LocalParkingIcon sx={{ color: '#388e3c' }} />
          </IconButton>
        </div>
      ) : (
        <Typography variant="body1" sx={{ color: '#9e9e9e' }}>No se encontró cliente.</Typography>
      )}

      {/* Modal para agregar nuevo cliente */}
      <Modal open={openAddModal} onClose={handleCloseAddModal}>
        <Box sx={style} component="form" onSubmit={handleAddClienteSubmit}>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32' }}>
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
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            label="Apellido"
            name="apellido"
            fullWidth
            value={newCliente.apellido}
            onChange={handleAddClienteChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            label="Cédula"
            name="cedula"
            fullWidth
            value={newCliente.cedula}
            onChange={handleAddClienteChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            label="Correo"
            name="correo"
            fullWidth
            value={newCliente.correo}
            onChange={handleAddClienteChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            label="Dirección"
            name="direccion"
            fullWidth
            value={newCliente.direccion}
            onChange={handleAddClienteChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            label="Teléfono"
            name="telefono"
            fullWidth
            value={newCliente.telefono}
            onChange={handleAddClienteChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            select
            label="Tipo de Identificación"
            name="tipo_identificacion"
            fullWidth
            value={newCliente.tipo_identificacion}
            onChange={handleAddClienteChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          >
            <MenuItem value="C">Cédula</MenuItem>
            <MenuItem value="P">Pasaporte</MenuItem>
            <MenuItem value="R">RUC</MenuItem>
          </TextField>

          <FormControlLabel
            control={
              <Checkbox
                checked={newCliente.NumeroCuantiaChecked}
                onChange={(e) =>
                  setNewCliente({
                    ...newCliente,
                    NumeroCuantiaChecked: e.target.checked,
                    NumeroCuantia: e.target.checked ? newCliente.NumeroCuantia : "", // Limpia el campo si se desmarca
                  })
                }
                name="NumeroCuantiaChecked"
              />
            }
            label="Cuantía"
          />

          <TextField
            label="Cuantía"
            name="NumeroCuantia"
            fullWidth
            value={newCliente.NumeroCuantia}
            onChange={handleAddClienteChange}
            margin="normal"
            disabled={!newCliente.NumeroCuantiaChecked} // Deshabilita si el checkbox no está marcado
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />

          <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}>
            Agregar
          </Button>
        </Box>
      </Modal>

      {/* Modal para gestionar placas */}
      <Modal open={openPlacasModal} onClose={handleClosePlacasModal}>
        <Box sx={style} component="form" onSubmit={handlePlacaSubmit}>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32' }}>
            Gestionar Placas del Cliente
          </Typography>
          {placas.length > 0 ? (
            placas.map((placa) => (
              <Box key={placa.id} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1">Placa: {placa.numero}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: '#9e9e9e' }}>No hay placas asociadas.</Typography>
          )}
          <TextField
            label="Nueva Placa"
            name="numero"
            fullWidth
            value={newPlaca.numero}
            onChange={(e) => setNewPlaca({ ...newPlaca, numero: e.target.value })}
            margin="normal"
            required
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}>
            Agregar Placa
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default VentaCliente;
