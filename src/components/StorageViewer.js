import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";

const StorageViewer = () => {
  const [storageData, setStorageData] = useState({});

  useEffect(() => {
    const allData = {};
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        allData[key] = localStorage.getItem(key);
      }
    }
    setStorageData(allData);
  }, []);

  const clearStorage = () => {
    localStorage.clear();
    setStorageData({});
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#eaf4f4", borderRadius: 2, boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Poppins, sans-serif", color: "#388e3c" }}>
        Datos del LocalStorage
      </Typography>
      {Object.keys(storageData).length > 0 ? (
        Object.keys(storageData).map((key) => (
          <Box key={key} sx={{ mb: 2, p: 2, backgroundColor: "#fff", borderRadius: 1, boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)" }}>
            <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", color: "#4caf50" }}>{key}:</Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", fontFamily: "Poppins, sans-serif" }}>
              {storageData[key]}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography sx={{ fontFamily: "Poppins, sans-serif", color: "#757575" }}>No hay datos almacenados en localStorage.</Typography>
      )}
      <Button variant="contained" color="primary" onClick={clearStorage} sx={{ mt: 3, backgroundColor: "#4caf50", fontFamily: "Poppins, sans-serif" }}>
        Limpiar Storage
      </Button>
    </Box>
  );
};

export default StorageViewer;
