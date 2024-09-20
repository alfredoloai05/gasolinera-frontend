import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import axios from "axios";
import html2pdf from "html2pdf.js";
import config from '../config';

function Reportes() {
  const [reportType, setReportType] = useState("gasolina");
  const [fecha, setFecha] = useState("");
  const [reportData, setReportData] = useState({ gasolina: [], productos: [] });
  const id_operador = localStorage.getItem("id_operador");

  const [tipoManguera, setTipoManguera] = useState("");
  const [formaPago, setFormaPago] = useState("");
  const [servicio, setServicio] = useState("");
  const [idEstante, setIdEstante] = useState("");

  const [tipoMangueraOptions, setTipoMangueraOptions] = useState([]);
  const [formaPagoOptions, setFormaPagoOptions] = useState([]);
  const [servicioOptions, setServicioOptions] = useState([]);
  const [estanteOptions, setEstanteOptions] = useState([]);

  useEffect(() => {
    if (reportType === "gasolina") {
      axios
        .get(`${config.apiUrl}/mangueras/operador/${id_operador}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          const tipos = [...new Set(response.data.map((m) => m.tipo_combustible))];
          setTipoMangueraOptions(tipos);
        })
        .catch((error) => {
          console.error("Error al cargar tipos de manguera", error);
        });

      axios
        .get(`${config.apiUrl}/formapagos`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setFormaPagoOptions(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar formas de pago", error);
        });

      axios
        .get(`${config.apiUrl}/servicios`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setServicioOptions(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar servicios", error);
        });
    } else if (reportType === "productos") {
      axios
        .get(`${config.apiUrl}/perchas/operador/${id_operador}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setEstanteOptions(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar estantes", error);
        });
    }
  }, [reportType, id_operador]);

  const handleGenerateReport = async () => {
    if (!fecha) {
      alert("Por favor, selecciona una fecha.");
      return;
    }

    let url = "";
    let params = {
      fecha: fecha,  // Solo enviamos la fecha
      id_operador: id_operador,
    };

    if (reportType === "gasolina") {
      url = `${config.apiUrl}/reporte_ventas_gasolina`;
      if (tipoManguera) params.tipo_manguera = tipoManguera;
      if (formaPago) params.forma_pago = formaPago;
      if (servicio) params.servicio = servicio;
    } else if (reportType === "productos") {
      url = `${config.apiUrl}/reporte_ventas_producto`;
      if (idEstante) params.id_estante = idEstante;
    } else if (reportType === "total") {
      url = `${config.apiUrl}/reporte_final`;
    }

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: params,
      });
      if (reportType === "gasolina") {
        setReportData({ ...reportData, gasolina: response.data });
      } else if (reportType === "productos") {
        setReportData({ ...reportData, productos: response.data });
      } else if (reportType === "total") {
        setReportData(response.data);  // Guardamos los datos del reporte final
      }
    } catch (error) {
      console.error("Error al obtener el reporte", error);
      alert("Ocurrió un error al generar el reporte.");
    }
  };

  const calcularTotalesGasolina = () => {
    if (!reportData.gasolina || !Array.isArray(reportData.gasolina)) return { numeroVentas: 0, totalVentas: 0 };

    const numeroVentas = reportData.gasolina.length;
    const totalVentas = reportData.gasolina.reduce(
      (acc, venta) => acc + parseFloat(venta.total || 0),
      0
    );
    return { numeroVentas, totalVentas };
  };

  const calcularTotalesProductos = () => {
    if (!reportData.productos || !Array.isArray(reportData.productos)) return { numeroVentas: 0, totalVentas: 0 };

    const ventasUnicas = new Set(reportData.productos.map((venta) => venta.id_venta));
    const numeroVentas = ventasUnicas.size;
    const totalVentas = reportData.productos.reduce(
      (acc, venta) => acc + parseFloat(venta.total_producto || 0),
      0
    );
    return { numeroVentas, totalVentas };
  };

  const renderReportData = () => {
    if (!reportData) return null;

    if (reportType === "gasolina") {
      const { numeroVentas = 0, totalVentas = 0 } = calcularTotalesGasolina();

      return (
        <Box>
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32', fontWeight: 'bold' }}>
            Reporte de Ventas de Gasolina
          </Typography>
          <Typography>
            <strong>Número de Ventas:</strong> {numeroVentas} | <strong>Total de Ventas:</strong> $
            {totalVentas.toFixed(2)}
          </Typography>
          {reportData.gasolina.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {reportData.gasolina.map((venta, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="h6">ID Venta: {venta.id}</Typography>
                        <Typography>Fecha: {new Date(venta.fecha).toLocaleString()}</Typography>
                        <Typography>Galones: {venta.galones}</Typography>
                        <Typography>Total: ${parseFloat(venta.total).toFixed(2)}</Typography>
                        <Typography>Cliente: {venta.cedula_cliente}</Typography>
                        <Typography>Tipo de Combustible: {venta.tipo_manguera}</Typography>
                        <Typography>Forma de Pago: {venta.forma_pago}</Typography>
                        <Typography>Servicio: {venta.servicio}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Typography sx={{ mt: 2 }}>No hay datos para mostrar.</Typography>
          )}
        </Box>
      );
    } else if (reportType === "productos") {
      const { numeroVentas = 0, totalVentas = 0 } = calcularTotalesProductos();

      return (
        <Box>
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32', fontWeight: 'bold' }}>
            Reporte de Ventas de Productos
          </Typography>
          <Typography>
            <strong>Número de Ventas:</strong> {numeroVentas} | <strong>Total de Ventas:</strong> $
            {totalVentas.toFixed(2)}
          </Typography>
          {reportData.productos.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {reportData.productos.map((venta, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="h6">ID Venta: {venta.id_venta}</Typography>
                        <Typography>Fecha: {new Date(venta.fecha).toLocaleString()}</Typography>
                        <Typography>Total Venta: ${parseFloat(venta.total_venta).toFixed(2)}</Typography>
                        <Typography>Cliente: {venta.cedula_cliente}</Typography>
                        <Typography>Estante: {venta.nombre_estante}</Typography>
                        <Typography>Producto: {venta.nombre_producto}</Typography>
                        <Typography>Cantidad: {venta.cantidad}</Typography>
                        <Typography>Total Producto: ${parseFloat(venta.total_producto).toFixed(2)}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Typography sx={{ mt: 2 }}>No hay datos para mostrar.</Typography>
          )}
        </Box>
      );
    } else if (reportType === "total") {
      const gasolina = reportData.gasolina || {};
      const productos = reportData.productos || {};

      const gasolinaVentasDia = gasolina.total_ventas_dia || { numero_ventas: 0, total_ventas: 0 };
      const productosVentasDia = productos.total_ventas_dia || { numero_ventas: 0, total_ventas: 0 };
      const ventasPorCombustible = gasolina.ventas_por_tipo_combustible || [];
      const ventasPorEstante = productos.ventas_por_estante || [];

      return (
        <Box>
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32', fontWeight: 'bold' }}>
            Reporte Final
          </Typography>

          {/* Reporte de Gasolina */}
          <Paper elevation={3} sx={{ p: 2, mt: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1">Ventas de Gasolina (Total del Día)</Typography>
            <Typography><strong>Número de Ventas:</strong> {gasolinaVentasDia.numero_ventas}</Typography>
            <Typography><strong>Total de Ventas:</strong> ${gasolinaVentasDia.total_ventas.toFixed(2)}</Typography>

            {/* Ventas por tipo de combustible */}
            {ventasPorCombustible.map((combustible, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Tipo de Combustible: {combustible.tipo_combustible}</Typography>
                <Typography><strong>Número de Ventas:</strong> {combustible.numero_ventas}</Typography>
                <Typography><strong>Total de Ventas:</strong> ${combustible.total_ventas.toFixed(2)}</Typography>
              </Box>
            ))}
          </Paper>

          {/* Reporte de Productos */}
          <Paper elevation={3} sx={{ p: 2, mt: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1">Ventas de Productos (Total del Día)</Typography>
            <Typography><strong>Número de Ventas:</strong> {productosVentasDia.numero_ventas}</Typography>
            <Typography><strong>Total de Ventas:</strong> ${productosVentasDia.total_ventas.toFixed(2)}</Typography>

            {/* Ventas por estante */}
            {ventasPorEstante.map((estante, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Estante: {estante.nombre_estante}</Typography>
                <Typography><strong>Número de Ventas:</strong> {estante.numero_ventas}</Typography>
                <Typography><strong>Total de Ventas:</strong> ${estante.total_ventas.toFixed(2)}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      );
    }
  };


  const handleGeneratePDF = () => {
    const element = document.getElementById("reportContent");

    const options = {
      margin: 1,
      filename: `reporte_${reportType}_${new Date().toLocaleDateString()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32' }}>
        Generar Reportes
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Tipo de Reporte</InputLabel>
        <Select
          value={reportType}
          onChange={(e) => {
            setReportType(e.target.value);
            setTipoManguera("");
            setFormaPago("");
            setServicio("");
            setIdEstante("");
            setReportData({ gasolina: [], productos: [] });
          }}
        >
          <MenuItem value="gasolina">Gasolina</MenuItem>
          <MenuItem value="productos">Productos</MenuItem>
          <MenuItem value="total">Total</MenuItem>
        </Select>
      </FormControl>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          sx={{ backgroundColor: 'white', borderRadius: 1 }}
        />
      </Grid>

      {reportType === "gasolina" && (
        <Box>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Combustible</InputLabel>
            <Select
              value={tipoManguera}
              onChange={(e) => setTipoManguera(e.target.value)}
              label="Tipo de Combustible"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {tipoMangueraOptions.map((tipo, index) => (
                <MenuItem key={index} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Forma de Pago</InputLabel>
            <Select
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              label="Forma de Pago"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {formaPagoOptions.map((option) => (
                <MenuItem key={option.id} value={option.tipo}>
                  {option.tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Servicio</InputLabel>
            <Select
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              label="Servicio"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {servicioOptions.map((option) => (
                <MenuItem key={option.id} value={option.tipo}>
                  {option.tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {reportType === "productos" && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Estante</InputLabel>
          <Select
            value={idEstante}
            onChange={(e) => setIdEstante(e.target.value)}
            label="Estante"
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {estanteOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}
          onClick={handleGenerateReport}
        >
          Generar Reporte
        </Button>

        {reportData &&
          ((reportType === "gasolina" && reportData.gasolina.length > 0) ||
            (reportType === "productos" && reportData.productos.length > 0) ||
            (reportType === "total" && reportData.gasolina && reportData.productos)) && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleGeneratePDF}
              sx={{ ml: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
            >
              Descargar PDF
            </Button>
          )}
      </Box>


      <Box id="reportContent" sx={{ mt: 4 }}>
        {renderReportData()}
      </Box>
    </Box>
  );
}

export default Reportes;
