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

function Reportes() {
  const [reportType, setReportType] = useState("gasolina");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState({ gasolina: [], productos: [] }); // Cambiado a tener siempre un objeto con gasolina y productos
  const id_operador = localStorage.getItem("id_operador");

  // Estados para filtros adicionales
  const [tipoManguera, setTipoManguera] = useState("");
  const [formaPago, setFormaPago] = useState("");
  const [servicio, setServicio] = useState("");
  const [idEstante, setIdEstante] = useState("");

  // Opciones para los select
  const [tipoMangueraOptions, setTipoMangueraOptions] = useState([]);
  const [formaPagoOptions, setFormaPagoOptions] = useState([]);
  const [servicioOptions, setServicioOptions] = useState([]);
  const [estanteOptions, setEstanteOptions] = useState([]);

  useEffect(() => {
    if (reportType === "gasolina") {
      // Cargar tipos de combustible asociados al operador
      axios
        .get(`http://localhost:5000/mangueras/operador/${id_operador}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          const tipos = [...new Set(response.data.map((m) => m.tipo_combustible))];
          setTipoMangueraOptions(tipos);
        })
        .catch((error) => {
          console.error("Error al cargar tipos de manguera", error);
        });

      // Cargar opciones de forma de pago
      axios
        .get("http://localhost:5000/formapagos", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setFormaPagoOptions(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar formas de pago", error);
        });

      // Cargar opciones de servicio
      axios
        .get("http://localhost:5000/servicios", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setServicioOptions(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar servicios", error);
        });
    } else if (reportType === "productos") {
      // Cargar perchas asignadas al operador
      axios
        .get(`http://localhost:5000/perchas/operador/${id_operador}`, {
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
    if (!fromDate || !toDate) {
      alert("Por favor, selecciona las fechas desde y hasta.");
      return;
    }

    let url = "";
    let params = {
      from_date: fromDate,
      to_date: toDate,
      id_operador: id_operador,
    };

    if (reportType === "gasolina") {
      url = "http://localhost:5000/reporte_ventas_gasolina";
      if (tipoManguera) params.tipo_manguera = tipoManguera;
      if (formaPago) params.forma_pago = formaPago;
      if (servicio) params.servicio = servicio;
    } else if (reportType === "productos") {
      url = "http://localhost:5000/reporte_ventas_producto";
      if (idEstante) params.id_estante = idEstante;
    } else if (reportType === "total") {
      await generateTotalReport();
      return;
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
      }
    } catch (error) {
      console.error("Error al obtener el reporte", error);
      alert("Ocurrió un error al generar el reporte.");
    }
  };

  const generateTotalReport = async () => {
    try {
      const [gasolinaResponse, productosResponse] = await Promise.all([
        axios.get("http://localhost:5000/reporte_ventas_gasolina", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: {
            from_date: fromDate,
            to_date: toDate,
            id_operador: id_operador,
          },
        }),
        axios.get("http://localhost:5000/reporte_ventas_producto", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: {
            from_date: fromDate,
            to_date: toDate,
            id_operador: id_operador,
          },
        }),
      ]);
      setReportData({
        gasolina: gasolinaResponse.data || [],
        productos: productosResponse.data || [],
      });
    } catch (error) {
      console.error("Error al obtener el reporte total", error);
      alert("Ocurrió un error al generar el reporte total.");
    }
  };

  // Funciones para calcular los totales
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
      const { numeroVentas, totalVentas } = calcularTotalesGasolina();

      return (
        <Box>
          <Typography variant="h6">Reporte de Ventas de Gasolina</Typography>
          <Typography>
            <strong>Número de Ventas:</strong> {numeroVentas} | <strong>Total de Ventas:</strong> $
            {totalVentas.toFixed(2)}
          </Typography>
          {reportData.gasolina.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {reportData.gasolina.map((venta, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card variant="outlined">
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
      const { numeroVentas, totalVentas } = calcularTotalesProductos();

      return (
        <Box>
          <Typography variant="h6">Reporte de Ventas de Productos</Typography>
          <Typography>
            <strong>Número de Ventas:</strong> {numeroVentas} | <strong>Total de Ventas:</strong> $
            {totalVentas.toFixed(2)}
          </Typography>
          {reportData.productos.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {reportData.productos.map((venta, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card variant="outlined">
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
      const totalesGasolina = calcularTotalesGasolina();
      const totalesProductos = calcularTotalesProductos();

      return (
        <Box>
          <Typography variant="h6">Reporte Total de Ventas</Typography>

          {/* Resumen de Gasolina */}
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1">Ventas de Gasolina</Typography>
            <Typography>
              <strong>Número de Ventas:</strong> {totalesGasolina.numeroVentas}
            </Typography>
            <Typography>
              <strong>Total de Ventas:</strong> ${totalesGasolina.totalVentas.toFixed(2)}
            </Typography>
          </Paper>

          {/* Resumen de Productos */}
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1">Ventas de Productos</Typography>
            <Typography>
              <strong>Número de Ventas:</strong> {totalesProductos.numeroVentas}
            </Typography>
            <Typography>
              <strong>Total de Ventas:</strong> ${totalesProductos.totalVentas.toFixed(2)}
            </Typography>
          </Paper>
        </Box>
      );
    }
  };

  // Función para generar el PDF
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
      <Typography variant="h5" gutterBottom>
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

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Desde"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Hasta"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Filtros adicionales para Gasolina */}
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

      {/* Filtros adicionales para Productos */}
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
          color="primary"
          onClick={handleGenerateReport}
        >
          Generar Reporte
        </Button>

        {/* Mostrar botón de descargar PDF si hay datos */}
        {reportData &&
          ((reportType === "gasolina" && reportData.gasolina.length > 0) ||
            (reportType === "productos" && reportData.productos.length > 0) ||
            (reportType === "total" &&
              ((reportData.gasolina && reportData.gasolina.length > 0) ||
                (reportData.productos && reportData.productos.length > 0)))) && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleGeneratePDF}
              sx={{ ml: 2 }}
            >
              Descargar PDF
            </Button>
          )}
      </Box>

      {/* Contenedor del reporte con ID para html2pdf */}
      <Box id="reportContent" sx={{ mt: 4 }}>
        {renderReportData()}
      </Box>
    </Box>
  );
}

export default Reportes;
