import React, { useState, useEffect } from "react";
import {
  Box,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import config from '../config'; 

function GrupoOperador() {
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupos, setSelectedGrupos] = useState([]);
  const [gruposDetalle, setGruposDetalle] = useState([]);

  const fetchGrupos = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/grupos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGrupos(response.data);
    } catch (error) {
      console.error("Error al cargar los grupos", error);
    }
  };

  const fetchGruposDetalle = async () => {
    try {
      const gruposAsignados = JSON.parse(localStorage.getItem("gruposAsignados")) || [];
      const gruposDetallePromises = gruposAsignados.map((grupoId) =>
        axios.get(`${config.apiUrl}/grupos_detalle/${grupoId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      );
      const gruposDetalleResponses = await Promise.all(gruposDetallePromises);
      setGruposDetalle(gruposDetalleResponses.map((response) => response.data));
    } catch (error) {
      console.error("Error al cargar los detalles de los grupos", error);
    }
  };

  useEffect(() => {
    fetchGrupos();
    fetchGruposDetalle();
  }, []);

  const handleSelectGrupo = (grupo) => {
    if (!grupo.estado) return;
    setSelectedGrupos((prevSelected) => {
      if (prevSelected.some((g) => g.id === grupo.id)) {
        return prevSelected.filter((g) => g.id !== grupo.id);
      } else {
        return [...prevSelected, grupo];
      }
    });
  };

  const handleAsignarGrupos = async () => {
    if (selectedGrupos.length === 0) return;
    try {
      const grupoIds = [];
      for (const grupo of selectedGrupos) {
        await axios.put(
          `${config.apiUrl}/grupo/${grupo.id}/asignar`,
          {},
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        grupoIds.push(grupo.id);
      }

      const gruposAsignados = JSON.parse(localStorage.getItem("gruposAsignados")) || [];
      const updatedGruposAsignados = [...new Set([...gruposAsignados, ...grupoIds])];
      localStorage.setItem("gruposAsignados", JSON.stringify(updatedGruposAsignados));

      alert("Grupos asignados exitosamente");
      fetchGrupos();
      fetchGruposDetalle();
      setSelectedGrupos([]);
    } catch (error) {
      console.error("Error al asignar los grupos", error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
        Selecciona uno o más Grupos
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, backgroundColor: '#f0f4f4', p: 2, borderRadius: 2, boxShadow: 3 }}>
        {grupos.map((grupo) => (
          <FormControlLabel
            key={grupo.id}
            control={
              <Checkbox
                checked={selectedGrupos.some((g) => g.id === grupo.id)}
                onChange={() => handleSelectGrupo(grupo)}
                disabled={!grupo.estado}
                sx={{
                  color: grupo.estado ? '#4caf50' : '#9e9e9e',
                  '&.Mui-checked': {
                    color: '#4caf50',
                  },
                }}
              />
            }
            label={grupo.nombre}
            sx={{
              opacity: grupo.estado ? 1 : 0.5,
              '& .MuiFormControlLabel-label': {
                color: grupo.estado ? '#2e7d32' : '#9e9e9e',
              },
            }}
          />
        ))}
      </Box>
      <Button
        variant="contained"
        onClick={handleAsignarGrupos}
        disabled={selectedGrupos.length === 0}
        sx={{
          mt: 2,
          backgroundColor: '#4caf50',
          color: 'white',
          '&:hover': {
            backgroundColor: '#388e3c',
          },
        }}
      >
        Asignar Grupos
      </Button>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, fontWeight: 'bold', color: '#2e7d32' }}>
        Grupos Asignados y Detalles
      </Typography>
      <Box>
        {gruposDetalle.map((grupoItem, idx) => (
          <Accordion key={idx} defaultExpanded sx={{ mb: 2, boxShadow: 2, backgroundColor: '#e8f5e9' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2e7d32' }} />}>
              <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                {grupoItem.grupo.nombre}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {grupoItem.dispensadores.map((dispensadorItem, dispIdx) => (
                <Box key={dispIdx} sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                    {dispensadorItem.dispensador.nombre}
                  </Typography>
                  {dispensadorItem.lados.map((ladoItem, ladoIdx) => (
                    <Box key={ladoIdx} sx={{ ml: 3 }}>
                      <Typography variant="body2" sx={{ color: '#4caf50' }}>
                        {ladoItem.lado.nombre}
                      </Typography>
                      {ladoItem.mangueras.length > 0 ? (
                        ladoItem.mangueras.map((mangueraItem, mangIdx) => (
                          <Typography key={mangIdx} variant="caption" sx={{ ml: 4, color: '#388e3c' }}>
                            {mangueraItem.nombre} - Tipo: {mangueraItem.tipo_combustible}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="caption" sx={{ ml: 4, color: '#9e9e9e' }}>
                          No hay mangueras asignadas
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </div>
  );
}

export default GrupoOperador;
