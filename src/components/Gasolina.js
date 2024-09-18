import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";
import config from '../config'; 

function Gasolina({ manguera, cliente, formaPago, servicio, fechaVenta, onVentaIniciada }) {
  const [galones, setGalones] = useState(0);
  const [total, setTotal] = useState(0);
  const [isVentaIniciada, setIsVentaIniciada] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [ventaData, setVentaData] = useState(null); 

  const precioPorGalon = 2.5; 

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const iniciarVenta = async () => {
    const dataParaEnviar = {
      tipo_manguera: manguera.tipo_combustible,
      cedula_cliente: cliente.cedula,
      numero_placa: cliente.placas[0]?.numero || "",
      servicio,
      forma_pago: formaPago,
      galones: 0,
      total: 0,
      fecha: fechaVenta.format("YYYY-MM-DD"), 
    };

    setVentaData(dataParaEnviar); 

    try {
      const response = await axios.post(`${config.apiUrl}/venta_gasolina`, dataParaEnviar, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const id = setInterval(() => {
        setGalones((prev) => prev + 0.1); 
        setTotal((prev) => prev + precioPorGalon * 0.1); 
      }, 1000);

      setIsVentaIniciada(true);
      setIntervalId(id);
      onVentaIniciada(); 
    } catch (error) {
      console.error("Error al iniciar la venta", error);
    }
  };

  const finalizarVenta = async () => {
    clearInterval(intervalId); 

    try {
      const ventaData = {
        galones,
        total,
        fecha: fechaVenta.format("YYYY-MM-DD"),
      };

      await axios.put(`${config.apiUrl}/venta_gasolina/${manguera.id}/finalizar`, ventaData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("Venta finalizada exitosamente");
    } catch (error) {
      console.error("Error al finalizar la venta", error);
    }
  };

  return (
    <Box sx={{ mt: 3, p: 3, backgroundColor: "#f0f9f4", borderRadius: "8px", boxShadow: 3 }}>
      {ventaData && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: "#e0f2e9", borderRadius: "8px" }}>
          <Typography variant="h6" color="primary">Datos de la Venta:</Typography>
          <Typography variant="body1">Tipo de Manguera: {ventaData.tipo_manguera}</Typography>
          <Typography variant="body1">Cédula Cliente: {ventaData.cedula_cliente}</Typography>
          <Typography variant="body1">Placa: {ventaData.numero_placa}</Typography>
          <Typography variant="body1">Servicio: {ventaData.servicio}</Typography>
          <Typography variant="body1">Forma de Pago: {ventaData.forma_pago}</Typography>
          <Typography variant="body1">Fecha de Venta: {ventaData.fecha}</Typography>
        </Box>
      )}

      {isVentaIniciada ? (
        <Box>
          <Typography variant="h6">
            Galones: {galones.toFixed(2)} | Total: ${total.toFixed(2)}
          </Typography>
          <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={finalizarVenta}>
            Finalizar Venta
          </Button>
        </Box>
      ) : (
        <Button variant="contained" color="primary" sx={{ backgroundColor: "#4caf50" }} onClick={iniciarVenta}>
          Iniciar Venta
        </Button>
      )}
    </Box>
  );
}

export default Gasolina;
