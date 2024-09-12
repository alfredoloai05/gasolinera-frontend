import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";

const Escaner = ({ onDatosDetectados, onClose }) => {
  const [capturando, setCapturando] = useState(false);
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 480,
    height: 320,
    facingMode: "environment", // Usa la cámara trasera del dispositivo si está disponible
  };

  // Captura la imagen del video y envía al backend
  const capturarImagen = async () => {
    setCapturando(true);
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await (await fetch(imageSrc)).blob(); // Convertir la imagen en un archivo Blob para el backend

    const formData = new FormData();
    formData.append("file", blob, "captura.jpg");

    try {
      const response = await axios.post("http://localhost:5000/detectar-placa", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const placa = response.data.resultado;
      
      // Buscar cliente por placa
      buscarClientePorPlaca(placa);
    } catch (error) {
      console.error("Error al detectar la placa:", error);
      setCapturando(false);
    }
  };

  const buscarClientePorPlaca = async (placa) => {
    try {
      const response = await axios.get(`http://localhost:5000/placa/${placa}/cliente`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const cliente = response.data;

      // Pasar los datos de la placa y cliente al componente padre
      onDatosDetectados({
        placa,
        cedula: cliente.cedula,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
      });

      // Cerrar automáticamente el escáner
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("Cliente no encontrado. Crea un nuevo cliente para continuar.");
        // Aquí el escáner puede manejar la creación del cliente como antes.
      } else {
        console.error("Error al buscar la placa", error);
      }
      setCapturando(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Typography variant="h5">Escáner de Placas</Typography>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />

      {/* Botón para capturar la imagen */}
      <Button
        variant="contained"
        color="primary"
        onClick={capturarImagen}
        disabled={capturando}
      >
        {capturando ? "Detectando..." : "Capturar Placa"}
      </Button>
    </Box>
  );
};

export default Escaner;
