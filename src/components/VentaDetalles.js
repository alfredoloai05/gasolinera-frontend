import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VentaCliente from "./VentaCliente";
import Detector from "./Detector";
import axios from "axios";
import config from "../config";

const VentaDetalle = ({ venta, onClose, onActualizar }) => {
  const [cedula, setCedula] = useState(venta.cedula_cliente);
  const [placa, setPlaca] = useState(venta.numero_placa);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isEscanerModalOpen, setIsEscanerModalOpen] = useState(false);

  const handleBuscarCliente = () => {
    setIsClienteModalOpen(true);
  };

  const handleEscanearPlaca = () => {
    setIsEscanerModalOpen(true);
  };

  const handleDatosCliente = (clienteData) => {
    setCedula(clienteData.cedula);
    setIsClienteModalOpen(false);
  };

  const handleDatosEscaner = (datosEscaner) => {
    setPlaca(datosEscaner.placa);
    setIsEscanerModalOpen(false);
  };

  const handleActualizar = async () => {
    try {
      const response = await axios.put(
        `${config.apiUrl}/venta_gasolina/${venta.id}/actualizar`,
        {
          cedula_cliente: cedula,
          numero_placa: placa,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Venta actualizada correctamente:", response.data);
      onActualizar(); // Refrescar ventas activas
      onClose(); // Cerrar modal al completar
    } catch (error) {
      console.error("Error al actualizar la venta:", error);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Detalles de la Venta - {venta.tipo_manguera}
        </Typography>

        <TextField
          label="Cédula del Cliente"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleBuscarCliente}>
                  <SearchIcon sx={{ color: "#4caf50" }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleEscanearPlaca}>
                  <CameraAltIcon sx={{ color: "#4caf50" }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleActualizar}
          sx={{ mt: 2 }}
        >
          Realizar Cambios
        </Button>

        {/* Modales para buscar cliente y escanear placa */}
        <Modal open={isClienteModalOpen} onClose={() => setIsClienteModalOpen(false)}>
          <Box sx={modalStyle}>
            <VentaCliente
              cedulaInicial={cedula} // Pasar la cédula actual al componente de búsqueda
              onClienteEncontrado={handleDatosCliente}
              onClose={() => setIsClienteModalOpen(false)}
            />
          </Box>
        </Modal>

        <Modal open={isEscanerModalOpen} onClose={() => setIsEscanerModalOpen(false)}>
          <Box sx={modalStyle}>
            <Detector
              onDatosDetectados={handleDatosEscaner}
              onClose={() => setIsEscanerModalOpen(false)}
            />
          </Box>
        </Modal>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default VentaDetalle;
