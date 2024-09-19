import React, { useEffect, useState } from "react";
import { LinearProgress, Typography, Box } from "@mui/material";

function Simulador({ venta, onSimulacionTerminada }) {
  const [galones, setGalones] = useState(Number(venta.galones) || 0);
  const [total, setTotal] = useState(Number(venta.total) || 0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const intervalDuration = 15000; 
    const incrementInterval = intervalDuration / 100; 

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          const iva = (total * 0.15).toFixed(2); // Calcula el 15% del total como IVA
          onSimulacionTerminada(galones, total, iva);
          return 100;
        }
        const nuevosGalones = Number(galones) + Math.random() * 2;
        const nuevoTotal = Number(total) + nuevosGalones * 2.5; 
        setGalones(nuevosGalones.toFixed(2)); 
        setTotal(nuevoTotal.toFixed(2)); 
        return prevProgress + 1; 
      });
    }, incrementInterval); 

    return () => clearInterval(interval);
  }, [galones, total, onSimulacionTerminada]);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: '#f0f4f4',
        mb: 2,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
        Galones: {galones}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
        Total: ${total}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#c8e6c9',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#4caf50',
          },
        }}
      />
    </Box>
  );
}

export default Simulador;
