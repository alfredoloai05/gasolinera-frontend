import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";

const Escaner = ({ onPlacaDetectada }) => {
  const [capturando, setCapturando] = useState(false);
  const [placaDetectada, setPlacaDetectada] = useState(null);
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
      setPlacaDetectada(placa);
      setCapturando(false);

      // Llamar la prop onPlacaDetectada para enviar la placa a VentaPlaca.js
      if (placa) {
        onPlacaDetectada(placa);
      }
    } catch (error) {
      console.error("Error al detectar la placa:", error);
      setCapturando(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Typography variant="h5">Escáner de Placas</Typography>

      {/* Muestra la cámara o la placa detectada */}
      {placaDetectada ? (
        <Typography variant="h6" color="primary">
          Placa Detectada: {placaDetectada}
        </Typography>
      ) : (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
      )}

      {/* Botón para capturar la imagen */}
      {!placaDetectada && (
        <Button
          variant="contained"
          color="primary"
          onClick={capturarImagen}
          disabled={capturando}
        >
          {capturando ? "Detectando..." : "Capturar Placa"}
        </Button>
      )}

      {/* Botón para reiniciar el escaneo */}
      {placaDetectada && (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setPlacaDetectada(null)}
        >
          Reiniciar Escaneo
        </Button>
      )}
    </Box>
  );
};

export default Escaner;
