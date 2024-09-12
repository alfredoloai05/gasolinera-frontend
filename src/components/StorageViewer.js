import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";

const StorageViewer = () => {
  const [storageData, setStorageData] = useState({});

  // Obtener todos los datos del localStorage
  useEffect(() => {
    const allData = {};
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        allData[key] = localStorage.getItem(key);
      }
    }
    setStorageData(allData);
  }, []);

  // Función para limpiar todo el localStorage
  const clearStorage = () => {
    localStorage.clear();
    setStorageData({});
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Datos del LocalStorage
      </Typography>
      {Object.keys(storageData).length > 0 ? (
        Object.keys(storageData).map((key) => (
          <Box key={key} sx={{ mb: 2 }}>
            <Typography variant="h6">{key}:</Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {storageData[key]}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography>No hay datos almacenados en localStorage.</Typography>
      )}
      <Button variant="contained" color="secondary" onClick={clearStorage}>
        Limpiar Storage
      </Button>
    </Box>
  );
};

export default StorageViewer;
