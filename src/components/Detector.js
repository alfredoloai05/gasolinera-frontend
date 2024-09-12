import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Box, Button, Typography, Modal, TextField } from "@mui/material";
import axios from "axios";

const Escaner = ({ onDatosDetectados, placaManual }) => {
  const [capturando, setCapturando] = useState(false);
  const [placaDetectada, setPlacaDetectada] = useState(null);
  const [creandoCliente, setCreandoCliente] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false); // Controla el modal para crear cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    correo: "",
    direccion: "",
  });

  const webcamRef = useRef(null);
  const videoConstraints = {
    width: 480,
    height: 320,
    facingMode: "environment",
  };

  useEffect(() => {
    if (placaManual) {
      buscarPlaca(placaManual); // Iniciar búsqueda automática si la placa viene del padre
    }
  }, [placaManual]); // Ejecutar el efecto solo cuando el valor de placaManual cambia

  // Captura la imagen del video y envía al backend
  const capturarImagen = async () => {
    setCapturando(true);
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await (await fetch(imageSrc)).blob();

    const formData = new FormData();
    formData.append("file", blob, "captura.jpg");

    try {
      const response = await axios.post("http://localhost:5000/detectar-placa", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPlacaDetectada(response.data.resultado);
      setCapturando(false);
      buscarPlaca(response.data.resultado); // Buscar la placa detectada
    } catch (error) {
      console.error("Error al detectar la placa:", error);
      setCapturando(false);
    }
  };

  // Función para buscar la placa en el backend
  const buscarPlaca = async (placa) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/placa/${placa}/cliente`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { cedula, nombre, apellido } = response.data;
      onDatosDetectados({ placa, cedula, nombre, apellido }); // Devolver los datos al componente padre
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPlacaDetectada(placa);
        setCreandoCliente(true); // Indica que no se encontró un cliente y se debe crear uno nuevo
        setOpenCreateModal(true); // Abrir modal para crear cliente
      } else {
        console.error("Error al buscar la placa:", error);
      }
    }
  };

  // Función para manejar los cambios en los campos del cliente
  const handleClienteChange = (e) => {
    setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });
  };

  // Función para crear un nuevo cliente
  const crearCliente = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post("http://localhost:5000/cliente", nuevoCliente, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpenCreateModal(false); // Cerrar modal después de crear el cliente
      setCreandoCliente(false);

      // Preguntar si desea asignar la placa al cliente
      const confirmar = window.confirm("¿Deseas asignar la placa a este nuevo cliente?");
      if (confirmar) {
        await asignarPlaca(nuevoCliente.cedula);
      }

      // Pasar los datos del nuevo cliente al componente padre
      onDatosDetectados({
        placa: placaDetectada,
        cedula: nuevoCliente.cedula,
        nombre: nuevoCliente.nombre,
        apellido: nuevoCliente.apellido,
      });
    } catch (error) {
      console.error("Error al crear cliente:", error);
    }
  };

  // Función para asignar la placa al cliente creado
  const asignarPlaca = async (cedula_cliente) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/placa",
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
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Typography variant="h5">Escáner de Placas</Typography>

      {placaDetectada && !creandoCliente ? (
        <Typography variant="h6" color="primary">
          Placa Detectada: {placaDetectada}
        </Typography>
      ) : !placaManual && !creandoCliente ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
      ) : null}

      {/* Si no estamos creando un cliente, mostrar botón para capturar */}
      {!creandoCliente && !placaManual && (
        <Button
          variant="contained"
          color="primary"
          onClick={capturarImagen}
          disabled={capturando}
        >
          {capturando ? "Detectando..." : "Capturar/Buscar Placa"}
        </Button>
      )}

      {creandoCliente && (
        <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>
              Crear Nuevo Cliente
            </Typography>
            <TextField
              label="Cédula"
              name="cedula"
              value={nuevoCliente.cedula}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Nombre"
              name="nombre"
              value={nuevoCliente.nombre}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Apellido"
              name="apellido"
              value={nuevoCliente.apellido}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Correo"
              name="correo"
              value={nuevoCliente.correo}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Dirección"
              name="direccion"
              value={nuevoCliente.direccion}
              onChange={handleClienteChange}
              fullWidth
              margin="normal"
              required
            />
            <Button
              variant="contained"
              color="primary"
              onClick={crearCliente}
              sx={{ mt: 2 }}
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
};

export default Escaner;
