import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

function Reporte() {
  const [resumen, setResumen] = useState({});

  useEffect(() => {
    const calcularResumenVentas = () => {
      let ventasFinalizadas = JSON.parse(localStorage.getItem("ventasFinalizadas")) || [];
      let resumenPorManguera = {};

      ventasFinalizadas.forEach((venta) => {
        const { manguera, precio_total, galones } = venta;

        if (!resumenPorManguera[manguera.nombre]) {
          resumenPorManguera[manguera.nombre] = { totalVendido: 0, galonesVendidos: 0 };
        }

        resumenPorManguera[manguera.nombre].totalVendido += precio_total;
        resumenPorManguera[manguera.nombre].galonesVendidos += galones;
      });

      setResumen(resumenPorManguera);
    };

    calcularResumenVentas();
  }, []);

  return (
    <Box>
      <Typography variant="h4">Reporte de Ventas por Manguera</Typography>
      {Object.keys(resumen).map((manguera) => (
        <Box key={manguera} sx={{ mt: 2 }}>
          <Typography variant="h6">Manguera: {manguera}</Typography>
          <Typography>Total Vendido: ${resumen[manguera].totalVendido.toFixed(2)}</Typography>
          <Typography>Galones Vendidos: {resumen[manguera].galonesVendidos.toFixed(2)}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default Reporte;
