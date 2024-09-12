import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";

function Gasolina({ manguera, cliente, formaPago, servicio, fechaVenta, onVentaIniciada }) {
  const [galones, setGalones] = useState(0);
  const [total, setTotal] = useState(0);
  const [isVentaIniciada, setIsVentaIniciada] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [ventaData, setVentaData] = useState(null); // Estado para almacenar los datos de la venta

  const precioPorGalon = 2.5; // Precio fijo por galón (puedes ajustarlo según sea necesario)

  useEffect(() => {
    // Limpiar el intervalo si el componente se desmonta
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Iniciar la venta y empezar a incrementar los galones
  const iniciarVenta = async () => {
    const dataParaEnviar = {
      tipo_manguera: manguera.tipo_combustible,
      cedula_cliente: cliente.cedula,
      numero_placa: cliente.placas[0]?.numero || "", // Asegúrate de que se selecciona una placa válida
      servicio,
      forma_pago: formaPago,
      galones: 0,
      total: 0,
      fecha: fechaVenta.format("YYYY-MM-DD"), // Fecha en formato adecuado
    };

    // Mostrar el mensaje con los datos que se van a enviar
    setVentaData(dataParaEnviar); 

    // Crear la venta en el backend
    try {
      const response = await axios.post("http://localhost:5000/venta_gasolina", dataParaEnviar, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Empezar la simulación de la venta
      const id = setInterval(() => {
        setGalones((prev) => prev + 0.1); // Aumentar galones
        setTotal((prev) => prev + precioPorGalon * 0.1); // Aumentar total según los galones
      }, 1000); // Incrementar cada segundo

      setIsVentaIniciada(true);
      setIntervalId(id);
      onVentaIniciada(); // Minimizar la venta
    } catch (error) {
      console.error("Error al iniciar la venta", error);
    }
  };

  // Finalizar la venta
  const finalizarVenta = async () => {
    clearInterval(intervalId); // Detener la simulación

    try {
      // Actualizar la venta con los galones y total
      const ventaData = {
        galones,
        total,
        fecha: fechaVenta.format("YYYY-MM-DD"),
      };

      await axios.put(`http://localhost:5000/venta_gasolina/${manguera.id}/finalizar`, ventaData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("Venta finalizada exitosamente");
    } catch (error) {
      console.error("Error al finalizar la venta", error);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Mostrar los datos que se enviarán antes de iniciar la venta */}
      {ventaData && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="secondary">Se enviarán estos datos:</Typography>
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
        <Button variant="contained" color="primary" onClick={iniciarVenta}>
          Iniciar Venta
        </Button>
      )}
    </Box>
  );
}

export default Gasolina;
