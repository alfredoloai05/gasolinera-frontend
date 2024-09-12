import React, { useEffect, useState } from "react";
import { LinearProgress, Typography, Box } from "@mui/material";

function Simulador({ venta, onSimulacionTerminada }) {
  const [galones, setGalones] = useState(Number(venta.galones) || 0);
  const [total, setTotal] = useState(Number(venta.total) || 0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const intervalDuration = 15000; // 15 seconds
    const incrementInterval = intervalDuration / 100; // Progress in percentage steps

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          onSimulacionTerminada(galones, total); // Llamada al callback para finalizar simulación
          return 100;
        }
        const nuevosGalones = Number(galones) + Math.random() * 2; // Incrementar galones aleatoriamente
        const nuevoTotal = Number(total) + nuevosGalones * 2.5; // Simular precio
        setGalones(nuevosGalones.toFixed(2)); // Mantener dos decimales
        setTotal(nuevoTotal.toFixed(2)); // Mantener dos decimales
        return prevProgress + 1; // Incrementar progreso
      });
    }, incrementInterval); // Actualizar el progreso cada 150ms

    return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonta
  }, [galones, total, onSimulacionTerminada]);

  return (
    <Box>
      <Typography variant="body2">Galones: {galones}</Typography>
      <Typography variant="body2">Total: ${total}</Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
}

export default Simulador;
