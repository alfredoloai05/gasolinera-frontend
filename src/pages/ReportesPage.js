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
} from "@mui/material";
import axios from "axios";
import html2pdf from "html2pdf.js";

function Reportes() {
  const [reportType, setReportType] = useState("gasolina");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState([]);
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
    // Cargar opciones para los select dependiendo del tipo de reporte
    if (reportType === "gasolina") {
      // Cargar tipos de combustible asociados al operador
      axios
        .get(`http://localhost:5000/mangueras/operador/${id_operador}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          // Extraer los tipos de combustible únicos
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
      console.log("Datos recibidos:", response.data);
      setReportData(response.data);
    } catch (error) {
      console.error("Error al obtener el reporte", error);
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
      console.log("Datos recibidos - Gasolina:", gasolinaResponse.data);
      console.log("Datos recibidos - Productos:", productosResponse.data);
      setReportData({
        gasolina: gasolinaResponse.data,
        productos: productosResponse.data,
      });
    } catch (error) {
      console.error("Error al obtener el reporte total", error);
    }
  };

  // Funciones para calcular los totales
  const calcularTotalesGasolina = () => {
    const numeroVentas = reportData.length;
    const totalVentas = reportData.reduce(
      (acc, venta) => acc + parseFloat(venta.total),
      0
    );
    return { numeroVentas, totalVentas };
  };

  const calcularTotalesProductos = () => {
    const ventasUnicas = {};
    reportData.forEach((venta) => {
      if (!ventasUnicas[venta.id_venta]) {
        ventasUnicas[venta.id_venta] = parseFloat(venta.total_venta);
      }
    });

    const numeroVentas = Object.keys(ventasUnicas).length;
    const totalVentas = Object.values(ventasUnicas).reduce(
      (acc, total) => acc + total,
      0
    );
    return { numeroVentas, totalVentas };
  };

  const renderReportData = () => {
    if (reportType === "gasolina") {
      const { numeroVentas, totalVentas } = calcularTotalesGasolina();

      return (
        <Box>
          <Typography variant="h6">Reporte de Ventas de Gasolina</Typography>
          <Typography>
            Número de Ventas: {numeroVentas} | Total de Ventas: $
            {totalVentas.toFixed(2)}
          </Typography>
          {reportData && reportData.length > 0 ? (
            reportData.map((venta, index) => (
              <Box key={index} sx={{ border: "1px solid gray", p: 2, mb: 2 }}>
                <Typography>ID Venta: {venta.id}</Typography>
                <Typography>
                  Fecha: {new Date(venta.fecha).toLocaleString()}
                </Typography>
                <Typography>Galones: {venta.galones}</Typography>
                <Typography>Total: {venta.total}</Typography>
                <Typography>Cliente: {venta.cedula_cliente}</Typography>
                <Typography>
                  Tipo de Combustible: {venta.tipo_manguera}
                </Typography>
                <Typography>Forma de Pago: {venta.forma_pago}</Typography>
                <Typography>Servicio: {venta.servicio}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No hay datos para mostrar.</Typography>
          )}
        </Box>
      );
    } else if (reportType === "productos") {
      const { numeroVentas, totalVentas } = calcularTotalesProductos();

      return (
        <Box>
          <Typography variant="h6">Reporte de Ventas de Productos</Typography>
          <Typography>
            Número de Ventas: {numeroVentas} | Total de Ventas: $
            {totalVentas.toFixed(2)}
          </Typography>
          {reportData && reportData.length > 0 ? (
            reportData.map((venta, index) => (
              <Box key={index} sx={{ border: "1px solid gray", p: 2, mb: 2 }}>
                <Typography>ID Venta: {venta.id_venta}</Typography>
                <Typography>
                  Fecha: {new Date(venta.fecha).toLocaleString()}
                </Typography>
                <Typography>Total Venta: {venta.total_venta}</Typography>
                <Typography>Cliente: {venta.cedula_cliente}</Typography>
                <Typography>Estante: {venta.nombre_estante}</Typography>
                <Typography>Producto: {venta.nombre_producto}</Typography>
                <Typography>Cantidad: {venta.cantidad}</Typography>
                <Typography>Total Producto: {venta.total_producto}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No hay datos para mostrar.</Typography>
          )}
        </Box>
      );
    } else if (reportType === "total") {
      const { gasolina, productos } = reportData;

      // Calcular totales para gasolina
      const totalesGasolina = {
        numeroVentas: gasolina.length,
        totalVentas: gasolina.reduce(
          (acc, venta) => acc + parseFloat(venta.total),
          0
        ),
      };

      // Calcular totales para productos
      const ventasUnicasProductos = {};
      productos.forEach((venta) => {
        if (!ventasUnicasProductos[venta.id_venta]) {
          ventasUnicasProductos[venta.id_venta] = parseFloat(venta.total_venta);
        }
      });

      const totalesProductos = {
        numeroVentas: Object.keys(ventasUnicasProductos).length,
        totalVentas: Object.values(ventasUnicasProductos).reduce(
          (acc, total) => acc + total,
          0
        ),
      };

      return (
        <Box>
          <Typography variant="h6">Reporte Total de Ventas</Typography>

          {/* Resumen de Gasolina */}
          <Typography variant="h6">Ventas de Gasolina</Typography>
          <Typography>
            Número de Ventas: {totalesGasolina.numeroVentas} | Total de Ventas: $
            {totalesGasolina.totalVentas.toFixed(2)}
          </Typography>
          {gasolina && gasolina.length > 0 ? (
            gasolina.map((venta, index) => (
              <Box key={index} sx={{ border: "1px solid gray", p: 2, mb: 2 }}>
                <Typography>ID Venta: {venta.id}</Typography>
                <Typography>
                  Fecha: {new Date(venta.fecha).toLocaleString()}
                </Typography>
                <Typography>Galones: {venta.galones}</Typography>
                <Typography>Total: {venta.total}</Typography>
                <Typography>Cliente: {venta.cedula_cliente}</Typography>
                <Typography>
                  Tipo de Combustible: {venta.tipo_manguera}
                </Typography>
                <Typography>Forma de Pago: {venta.forma_pago}</Typography>
                <Typography>Servicio: {venta.servicio}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No hay datos para mostrar.</Typography>
          )}

          {/* Resumen de Productos */}
          <Typography variant="h6">Ventas de Productos</Typography>
          <Typography>
            Número de Ventas: {totalesProductos.numeroVentas} | Total de Ventas: $
            {totalesProductos.totalVentas.toFixed(2)}
          </Typography>
          {productos && productos.length > 0 ? (
            productos.map((venta, index) => (
              <Box key={index} sx={{ border: "1px solid gray", p: 2, mb: 2 }}>
                <Typography>ID Venta: {venta.id_venta}</Typography>
                <Typography>
                  Fecha: {new Date(venta.fecha).toLocaleString()}
                </Typography>
                <Typography>Total Venta: {venta.total_venta}</Typography>
                <Typography>Cliente: {venta.cedula_cliente}</Typography>
                <Typography>Estante: {venta.nombre_estante}</Typography>
                <Typography>Producto: {venta.nombre_producto}</Typography>
                <Typography>Cantidad: {venta.cantidad}</Typography>
                <Typography>Total Producto: {venta.total_producto}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No hay datos para mostrar.</Typography>
          )}
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
            // Reiniciar filtros adicionales
            setTipoManguera("");
            setFormaPago("");
            setServicio("");
            setIdEstante("");
          }}
        >
          <MenuItem value="gasolina">Gasolina</MenuItem>
          <MenuItem value="productos">Productos</MenuItem>
          <MenuItem value="total">Total</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Desde"
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Hasta"
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      {/* Filtros adicionales para Gasolina */}
      {reportType === "gasolina" && (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Combustible</InputLabel>
            <Select
              value={tipoManguera}
              onChange={(e) => setTipoManguera(e.target.value)}
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
        </>
      )}

      {/* Filtros adicionales para Productos */}
      {reportType === "productos" && (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel>Estante</InputLabel>
            <Select
              value={idEstante}
              onChange={(e) => setIdEstante(e.target.value)}
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
        </>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerateReport}
        sx={{ mt: 2 }}
      >
        Generar Reporte
      </Button>

      {/* Mostrar botón de descargar PDF si hay datos */}
      {reportData &&
        ((Array.isArray(reportData) && reportData.length > 0) ||
          (reportType === "total" &&
            ((reportData.gasolina && reportData.gasolina.length > 0) ||
              (reportData.productos && reportData.productos.length > 0)))) && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleGeneratePDF}
            sx={{ mt: 2, ml: 2 }}
          >
            Descargar PDF
          </Button>
        )}

      {/* Contenedor del reporte con ID para html2pdf */}
      <Box id="reportContent" sx={{ mt: 4 }}>
        {renderReportData()}
      </Box>
    </Box>
  );
}

export default Reportes;
