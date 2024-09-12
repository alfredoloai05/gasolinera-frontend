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
import axios from "axios";

function GrupoOperador() {
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupos, setSelectedGrupos] = useState([]); // Grupos seleccionados
  const [gruposDetalle, setGruposDetalle] = useState([]);

  // Obtener los grupos
  const fetchGrupos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/grupos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGrupos(response.data); // Guardar todos los grupos
    } catch (error) {
      console.error("Error al cargar los grupos", error);
    }
  };

  // Obtener los grupos detallados asignados al operador actual
  const fetchGruposDetalle = async () => {
    try {
      const gruposAsignados = JSON.parse(localStorage.getItem('gruposAsignados')) || [];
      const gruposDetallePromises = gruposAsignados.map((grupoId) =>
        axios.get(`http://localhost:5000/grupos_detalle/${grupoId}`, {
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

  // Manejar la selección de los grupos (permitir marcar/desmarcar)
  const handleSelectGrupo = (grupo) => {
    if (!grupo.estado) return; // No permitir seleccionar grupos ocupados

    // Alternar el grupo seleccionado (marcar/desmarcar)
    setSelectedGrupos((prevSelected) => {
      if (prevSelected.some((g) => g.id === grupo.id)) {
        return prevSelected.filter((g) => g.id !== grupo.id); // Desmarcar
      } else {
        return [...prevSelected, grupo]; // Marcar
      }
    });
  };

  const handleAsignarGrupos = async () => {
    if (selectedGrupos.length === 0) return;

    try {
      const grupoIds = [];
      for (const grupo of selectedGrupos) {
        await axios.put(
          `http://localhost:5000/grupo/${grupo.id}/asignar`,
          {}, // No se necesita pasar ningún dato, ya que el operador se obtiene del JWT
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        grupoIds.push(grupo.id); // Guardar el ID del grupo asignado
      }

      // Guardar los IDs de los grupos asignados en el localStorage
      const gruposAsignados = JSON.parse(localStorage.getItem('gruposAsignados')) || [];
      const updatedGruposAsignados = [...new Set([...gruposAsignados, ...grupoIds])]; // Evitar duplicados
      localStorage.setItem('gruposAsignados', JSON.stringify(updatedGruposAsignados));

      alert("Grupos asignados exitosamente");
      fetchGrupos(); // Recargar los grupos para ver el estado actualizado
      fetchGruposDetalle(); // Recargar la vista del árbol de grupos
      setSelectedGrupos([]); // Limpiar la selección
    } catch (error) {
      console.error("Error al asignar los grupos", error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Selecciona uno o más Grupos
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {grupos.map((grupo) => (
          <FormControlLabel
            key={grupo.id}
            control={
              <Checkbox
                checked={selectedGrupos.some((g) => g.id === grupo.id)}
                onChange={() => handleSelectGrupo(grupo)}
                disabled={!grupo.estado} // Deshabilitar si el grupo no está disponible
                style={{ opacity: grupo.estado ? 1 : 0.5 }} // Opacar si no está disponible
              />
            }
            label={grupo.nombre}
          />
        ))}
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAsignarGrupos}
        disabled={selectedGrupos.length === 0} // Desactivar si no hay grupos seleccionados
        sx={{ mt: 2 }}
      >
        Asignar Grupos
      </Button>

      {/* Añadir visualización de la estructura en forma de árbol */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Grupos Asignados y Detalles
      </Typography>
      <Box>
        {gruposDetalle.map((grupoItem, idx) => (
          <Accordion key={idx} defaultExpanded>
            <AccordionSummary>
              <Typography variant="h6">{grupoItem.grupo.nombre}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {grupoItem.dispensadores.map((dispensadorItem, dispIdx) => (
                <Box key={dispIdx} sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    {dispensadorItem.dispensador.nombre}
                  </Typography>
                  {dispensadorItem.lados.map((ladoItem, ladoIdx) => (
                    <Box key={ladoIdx} sx={{ ml: 3 }}>
                      <Typography variant="body2">
                        {ladoItem.lado.nombre}
                      </Typography>
                      {ladoItem.mangueras.length > 0 ? (
                        ladoItem.mangueras.map((mangueraItem, mangIdx) => (
                          <Typography key={mangIdx} variant="caption" sx={{ ml: 4 }}>
                            {mangueraItem.nombre} - Tipo: {mangueraItem.tipo_combustible}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="caption" sx={{ ml: 4 }}>
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
