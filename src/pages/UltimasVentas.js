import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import axios from "axios";
import html2pdf from "html2pdf.js";
import Alert from "@mui/material/Alert";

function UltimasVentas() {
  const [ventas, setVentas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener las últimas 10 ventas al cargar el componente
    const fetchUltimasVentas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/ventas_ultimas", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setVentas(response.data);
      } catch (error) {
        setError("Error al obtener las últimas ventas");
        console.error("Error al obtener las últimas ventas:", error);
      }
    };

    fetchUltimasVentas();
  }, []);

  // Función para manejar la reimpresión y generar el PDF
  const handleReimprimir = async (venta) => {
    try {
      // Obtener los datos del cliente por cédula
      const response = await axios.get(`http://localhost:5000/clientes?cedula=${venta.cedula_cliente}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const cliente = response.data[0]; // Obtener el primer resultado

      // Crear el contenido de la factura
      const facturaContent = `
        <div style="font-family: 'Poppins', sans-serif; padding: 20px;">
          <h2 style="color: #2e7d32;">Factura de Venta</h2>
          <hr />
          <h3>Detalles del Cliente</h3>
          <p><strong>Nombre:</strong> ${cliente.nombre} ${cliente.apellido}</p>
          <p><strong>Cédula:</strong> ${cliente.cedula}</p>
          <p><strong>Dirección:</strong> ${cliente.direccion || "No disponible"}</p>
          <p><strong>Teléfono:</strong> ${cliente.telefono || "No disponible"}</p>
          <hr />
          <h3>Detalles de la Venta</h3>
          <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString()}</p>
          <p><strong>Tipo de Manguera:</strong> ${venta.tipo_manguera}</p>
          <p><strong>Número de Placa:</strong> ${venta.numero_placa}</p>
          <p><strong>Servicio:</strong> ${venta.servicio}</p>
          <p><strong>Forma de Pago:</strong> ${venta.forma_pago}</p>
          <p><strong>Galones:</strong> ${venta.galones}</p>
          <p><strong>Total:</strong> $${parseFloat(venta.total).toFixed(2)}</p>
        </div>
      `;

      // Configuración para generar el PDF
      const options = {
        margin: 1,
        filename: `factura_venta_${venta.id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
      };

      // Generar y descargar el PDF
      const element = document.createElement("div");
      element.innerHTML = facturaContent;
      html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error("Error al obtener los datos del cliente o generar el PDF:", error);
      setError("Error al generar la factura. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f0f4f4", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
          color: "#2e7d32",
          textAlign: "center",
          borderBottom: "2px solid #2e7d32",
          pb: 1,
        }}
      >
        Últimas 10 Ventas
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#4caf50" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Tipo Manguera</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Cédula Cliente</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Placa</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Servicio</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Forma de Pago</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Galones</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Fecha</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ventas.map((venta) => (
              <TableRow key={venta.id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" } }}>
                <TableCell>{venta.tipo_manguera}</TableCell>
                <TableCell>{venta.cedula_cliente}</TableCell>
                <TableCell>{venta.numero_placa}</TableCell>
                <TableCell>{venta.servicio}</TableCell>
                <TableCell>{venta.forma_pago}</TableCell>
                <TableCell>{venta.galones}</TableCell>
                <TableCell>${parseFloat(venta.total).toFixed(2)}</TableCell>
                <TableCell>{new Date(venta.fecha).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleReimprimir(venta)}
                    startIcon={<PrintIcon />}
                    sx={{
                      backgroundColor: "#4caf50",
                      "&:hover": {
                        backgroundColor: "#388e3c",
                      },
                    }}
                  >
                    Reimprimir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default UltimasVentas;
