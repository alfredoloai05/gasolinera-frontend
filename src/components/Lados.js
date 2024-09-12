import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from "@mui/material";
import axios from "axios";

function Lados({ onSeleccionManguera }) {
  const [ladosMangueras, setLadosMangueras] = useState([]);

  // Obtener los lados y mangueras asignados
  const fetchLadosMangueras = async () => {
    const gruposAsignados = JSON.parse(localStorage.getItem("gruposAsignados")) || [];
    const ladosManguerasAsignados = [];
    for (const grupoId of gruposAsignados) {
      const response = await axios.get(`http://localhost:5000/grupos_detalle/${grupoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      ladosManguerasAsignados.push(...response.data.dispensadores.map((dispensador) => dispensador.lados));
    }
    setLadosMangueras(ladosManguerasAsignados.flat()); // Aplanar el array de lados
  };

  useEffect(() => {
    fetchLadosMangueras();
  }, []);

  // Manejar la selección de la manguera
  const handleSeleccionManguera = (manguera, ladoNombre) => {
    // Pasamos la selección al componente padre
    onSeleccionManguera(manguera, ladoNombre);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Selecciona una Manguera
      </Typography>
      {ladosMangueras.length > 0 ? (
        ladosMangueras.map((lado, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {`Lado ${index + 1}`}
            </Typography>
            {lado.mangueras.length > 0 ? (
              <Grid container spacing={2}>
                {lado.mangueras.map((manguera) => (
                  <Grid item key={manguera.id}>
                    <Card sx={{ width: 200 }}>
                      <CardContent>
                        <Typography variant="body2">{manguera.tipo_combustible}</Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleSeleccionManguera(manguera, `Lado ${index + 1}`)}
                        >
                          Seleccionar
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No existen mangueras para este lado.
              </Typography>
            )}
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="textSecondary">
          No hay lados disponibles.
        </Typography>
      )}
    </Box>
  );
}

export default Lados;
