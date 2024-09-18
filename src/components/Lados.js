import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from "@mui/material";
import axios from "axios";
import config from '../config'; 

function Lados({ onSeleccionManguera }) {
  const [ladosMangueras, setLadosMangueras] = useState([]);

  const fetchLadosMangueras = async () => {
    const gruposAsignados = JSON.parse(localStorage.getItem("gruposAsignados")) || [];
    const ladosManguerasAsignados = [];
    for (const grupoId of gruposAsignados) {
      const response = await axios.get(`${config.apiUrl}/grupos_detalle/${grupoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      ladosManguerasAsignados.push(...response.data.dispensadores.map((dispensador) => dispensador.lados));
    }
    setLadosMangueras(ladosManguerasAsignados.flat());
  };

  useEffect(() => {
    fetchLadosMangueras();
  }, []);

  const handleSeleccionManguera = (manguera, ladoNombre) => {
    onSeleccionManguera(manguera, ladoNombre);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
        Selecciona una Manguera
      </Typography>
      {ladosMangueras.length > 0 ? (
        ladosMangueras.map((lado, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#388e3c' }}>
              {`Lado ${index + 1}`}
            </Typography>
            {lado.mangueras.length > 0 ? (
              <Grid container spacing={2}>
                {lado.mangueras.map((manguera) => (
                  <Grid item key={manguera.id}>
                    <Card sx={{ width: 200, backgroundColor: '#e8f5e9', boxShadow: 3, borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          {manguera.tipo_combustible}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          sx={{
                            color: 'white',
                            backgroundColor: '#4caf50',
                            '&:hover': {
                              backgroundColor: '#388e3c',
                            },
                          }}
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
