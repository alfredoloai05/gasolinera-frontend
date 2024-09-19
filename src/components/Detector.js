import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Box, Button, Typography, Modal, TextField, CircularProgress, IconButton, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import config from '../config'; 

const Escaner = ({ onDatosDetectados, placaManual }) => {
  const [capturando, setCapturando] = useState(false);
  const [placaDetectada, setPlacaDetectada] = useState(null);
  const [creandoCliente, setCreandoCliente] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
    telefono: "",
    tipo_identificacion: "C",
    NumeroCuantia: "",
    NumeroCuantiaChecked: false,
  });

  const webcamRef = useRef(null);
  const videoConstraints = {
    width: 480,
    height: 320,
    facingMode: "environment",
  };

  useEffect(() => {
    if (placaManual) {
      buscarPlaca(placaManual);
    }
  }, [placaManual]);

  useEffect(() => {
    const { cedula } = nuevoCliente;
    if (cedula.length === 10) {
      setNuevoCliente((prev) => ({ ...prev, tipo_identificacion: "C" }));
    } else if (cedula.length === 13) {
      setNuevoCliente((prev) => ({ ...prev, tipo_identificacion: "R" }));
    } else {
      setNuevoCliente((prev) => ({ ...prev, tipo_identificacion: "P" }));
    }
  }, [nuevoCliente.cedula]);

  const capturarImagen = async () => {
    setCapturando(true);
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await (await fetch(imageSrc)).blob();

    const formData = new FormData();
    formData.append("file", blob, "captura.jpg");

    try {
      const response = await axios.post(`${config.apiUrl}/detectar-placa`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPlacaDetectada(response.data.resultado);
      buscarPlaca(response.data.resultado);
    } catch (error) {
      console.error("Error al detectar la placa:", error);
    } finally {
      setCapturando(false);
    }
  };

  const buscarPlaca = async (placa) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${config.apiUrl}/placa/${placa}/cliente`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const { cedula, nombre, apellido, NumeroCuantia, EntidadPublica, codigo, placas } = response.data;
  
      onDatosDetectados({
        placa,
        cedula,
        nombre,
        apellido,
        NumeroCuantia: NumeroCuantia || "",
        NumeroCuantiaChecked: !!NumeroCuantia,
        EntidadPublica: EntidadPublica || false, // Asegúrate de manejar este caso
        codigo: codigo || "", // Asegúrate de manejar este caso
        placas: placas || [],
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPlacaDetectada(placa);
        setCreandoCliente(true);
        setOpenCreateModal(true);
      } else {
        console.error("Error al buscar la placa:", error);
      }
    }
  };
  
  

  const handleClienteChange = (e) => {
    setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });
  };

  const buscarClientePorCedula = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${config.apiUrl}/cliente/cedula/${nuevoCliente.cedula}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const confirmar = window.confirm("Cliente encontrado. ¿Deseas asignar esta placa al cliente existente?");
      if (confirmar) {
        await asignarPlaca(nuevoCliente.cedula);
        onDatosDetectados({
          placa: placaDetectada,
          cedula: response.data.cedula,
          nombre: response.data.nombre,
          apellido: response.data.apellido,
          NumeroCuantia: response.data.NumeroCuantia || "",
          NumeroCuantiaChecked: !!response.data.NumeroCuantia,
          placas: response.data.placas || [],
        });
        setOpenCreateModal(false);
        setCreandoCliente(false);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("Cliente no encontrado. Continúa con el registro manual.");
      } else {
        console.error("Error al buscar el cliente por cédula:", error);
      }
    }
  };

  const crearCliente = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(`${config.apiUrl}/cliente`, nuevoCliente, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpenCreateModal(false);
      setCreandoCliente(false);

      const confirmar = window.confirm("¿Deseas asignar la placa a este nuevo cliente?");
      if (confirmar) {
        await asignarPlaca(nuevoCliente.cedula);
      }

      onDatosDetectados({
        placa: placaDetectada,
        cedula: nuevoCliente.cedula,
        nombre: nuevoCliente.nombre,
        apellido: nuevoCliente.apellido,
        NumeroCuantia: nuevoCliente.NumeroCuantia || "",
        NumeroCuantiaChecked: !!nuevoCliente.NumeroCuantia,
        placas: [],
      });
    } catch (error) {
      console.error("Error al crear cliente:", error);
    }
  };

  const asignarPlaca = async (cedula_cliente) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.apiUrl}/placa`,
        {
          numero: placaDetectada,
          cedula_cliente,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error al asignar la placa:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        p: 2,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: '#f0f4f4',
        maxWidth: 500,
        margin: "auto",
      }}
    >
      <Typography variant="h5" sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32', fontWeight: 'bold' }}>
        Escáner de Placas
      </Typography>

      {placaDetectada && !creandoCliente ? (
        <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", color: '#4caf50', fontWeight: 'bold' }}>
          Placa Detectada: {placaDetectada}
        </Typography>
      ) : !placaManual && !creandoCliente ? (
        <Box
          sx={{
            width: 480,
            height: 320,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            borderRadius: 2,
            boxShadow: 3,
            mb: 2,
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={{ borderRadius: '8px' }}
          />
        </Box>
      ) : null}

      {!creandoCliente && !placaManual && (
        <Button
          variant="contained"
          onClick={capturarImagen}
          disabled={capturando}
          sx={{
            mt: 2,
            fontFamily: "Poppins, sans-serif",
            backgroundColor: '#4caf50',
            color: 'white',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: '#388e3c',
            },
          }}
        >
          {capturando ? <CircularProgress size={24} color="inherit" /> : "Capturar/Buscar Placa"}
        </Button>
      )}

      {creandoCliente && (
        <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32' }}>
              Crear Nuevo Cliente
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label="Cédula"
                name="cedula"
                value={nuevoCliente.cedula}
                onChange={handleClienteChange}
                fullWidth
                margin="normal"
                required
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
              />
              <IconButton onClick={buscarClientePorCedula} sx={{ mt: 1 }}>
                <SearchIcon />
              </IconButton>
            </Box>
            <TextField
              label="Nombre"
              name="nombre"
              value={nuevoCliente.nombre}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <TextField
              label="Apellido"
              name="apellido"
              value={nuevoCliente.apellido}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <TextField
              label="Correo"
              name="correo"
              value={nuevoCliente.correo}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <TextField
              label="Dirección"
              name="direccion"
              value={nuevoCliente.direccion}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <TextField
              label="Teléfono"
              name="telefono"
              value={nuevoCliente.telefono}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <TextField
              select
              label="Tipo de Identificación"
              name="tipo_identificacion"
              value={nuevoCliente.tipo_identificacion}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            >
              <MenuItem value="C">Cédula</MenuItem>
              <MenuItem value="P">Pasaporte</MenuItem>
              <MenuItem value="R">RUC</MenuItem>
            </TextField>
            <Button
              variant="contained"
              onClick={crearCliente}
              sx={{
                mt: 2,
                fontFamily: "Poppins, sans-serif",
                backgroundColor: '#4caf50',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#388e3c',
                },
              }}
              fullWidth
            >
              Crear Cliente
            </Button>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

// Estilos para el modal
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

export default Escaner;
