import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Card,
  CardContent,
  CardActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import Simulador from "../components/Simulador";
import Lados from "../components/Lados";
import Escaner from "../components/Detector";
import VentaCliente from "../components/VentaCliente";
import config from '../config'; 

const getFechaActual = () => {
  return new Date().toISOString();
};

function DespachoOperador() {
  const [ventasActivas, setVentasActivas] = useState([]);
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);
  const [isMangueraModalOpen, setIsMangueraModalOpen] = useState(false);
  const [isEscanerModalOpen, setIsEscanerModalOpen] = useState(false);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [selectedManguera, setSelectedManguera] = useState(null);
  const [selectedLado, setSelectedLado] = useState(null);
  const [clienteInfo, setClienteInfo] = useState({ nombre: "", apellido: "", placas: [] });
  const [formasPago, setFormasPago] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [formData, setFormData] = useState({
    tipo_manguera: "",
    cedula_cliente: "",
    numero_placa: "",
    servicio: "",
    forma_pago: "",
  });

  useEffect(() => {
    cargarFormasPago();
    cargarServicios();
    cargarVentasActivas();
  }, []);

  const cargarFormasPago = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/formapagos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFormasPago(response.data);
      setFormData((prevFormData) => ({
        ...prevFormData,
        forma_pago: response.data[0]?.tipo || "",
      }));
    } catch (error) {
      console.error("Error al cargar las formas de pago", error);
    }
  };

  const terminarSimulacion = (id, galones, total) => {
    setVentasActivas((prevVentas) =>
      prevVentas.map((venta) =>
        venta.id === id
          ? { ...venta, galones, total, simulacionTerminada: true }
          : venta
      )
    );
  };

  const finalizarVenta = async (id, galones, total) => {
    try {
      await axios.put(
        `${config.apiUrl}/venta_gasolina/${id}/finalizar`,
        { galones, total, fecha: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      cargarVentasActivas();
    } catch (error) {
      console.error("Error al finalizar la venta", error);
    }
  };

  const abrirModalVenta = () => {
    setFormData({
      tipo_manguera: "",
      cedula_cliente: "",
      numero_placa: "",
      servicio: servicios[0]?.tipo || "",
      forma_pago: formasPago[0]?.tipo || "",
    });
    setSelectedManguera(null);
    setSelectedLado(null);
    setIsVentaModalOpen(true);
  };

  const cargarServicios = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/servicios`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setServicios(response.data);
      setFormData((prevFormData) => ({
        ...prevFormData,
        servicio: response.data[0]?.tipo || "",
      }));
    } catch (error) {
      console.error("Error al cargar los servicios", error);
    }
  };

  const cargarVentasActivas = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/ventas_activas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVentasActivas(response.data);
    } catch (error) {
      console.error("Error al cargar las ventas activas", error);
    }
  };

  const iniciarVenta = async (ventaData) => {
    try {
      const id_operador = localStorage.getItem("id_operador");
      const ventaConOperador = { ...ventaData, id_operador, fecha: getFechaActual() };

      const response = await axios.post(`${config.apiUrl}/venta_gasolina`, ventaConOperador, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const nuevaVenta = {
        ...ventaConOperador,
        id: response.data.id,
        galones: 0,
        total: 0,
        estado: true,
        simulacionTerminada: false,
        lado: selectedLado,
        tipo_manguera: selectedManguera?.tipo_combustible,
      };

      setVentasActivas([...ventasActivas, nuevaVenta]);
      cerrarModalVenta();
    } catch (error) {
      console.error("Error al iniciar la venta", error);
    }
  };

  const cerrarModalVenta = () => {
    setFormData({
      tipo_manguera: "",
      cedula_cliente: "",
      numero_placa: "",
      servicio: servicios[0]?.tipo || "",
      forma_pago: formasPago[0]?.tipo || "",
    });
    setClienteInfo({ nombre: "", apellido: "", placas: [] });
    setIsVentaModalOpen(false);
  };

  const abrirEscanerYBuscarPlaca = () => {
    setIsEscanerModalOpen(true);
  };

  const abrirBusquedaCliente = () => {
    setIsClienteModalOpen(true);
  };

  const manejarDatosEscaner = ({ placa, cedula, nombre, apellido }) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      numero_placa: placa,
      cedula_cliente: cedula,
    }));
    setClienteInfo({ nombre, apellido, placas: [] });
    setIsEscanerModalOpen(false);
  };

  const manejarDatosCliente = (clienteData) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      cedula_cliente: clienteData.cedula,
      numero_placa: clienteData.placas.length > 0 ? clienteData.placas[0].numero : "",
    }));
    setClienteInfo({
      nombre: clienteData.nombre,
      apellido: clienteData.apellido,
      placas: clienteData.placas || [],
    });
    setIsClienteModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSeleccionManguera = (manguera, lado) => {
    setSelectedManguera(manguera);
    setSelectedLado(lado);
    setIsMangueraModalOpen(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32', fontWeight: 'bold' }}>
        Ventas Activas
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        {ventasActivas.map((venta) => (
          <Card
            key={venta.id}
            sx={{
              width: 250,
              border: venta.simulacionTerminada ? "3px solid #4caf50" : "1px solid grey",
              backgroundColor: venta.simulacionTerminada ? "#e8f5e9" : "white",
              transition: "0.3s",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                {venta.lado} - {venta.tipo_manguera}
              </Typography>
              <Typography variant="body2">Cliente: {venta.cedula_cliente}</Typography>
              <Typography variant="body2">Placa: {venta.numero_placa}</Typography>
              <Typography variant="body2">Galones: {venta.galones}</Typography>
              <Typography variant="body2">Total: ${venta.total}</Typography>
              <Typography variant="body2">
                Fecha: {new Date(venta.fecha).toLocaleString()}
              </Typography>
            </CardContent>
            <CardActions>
              {!venta.simulacionTerminada && (
                <Simulador
                  venta={venta}
                  onSimulacionTerminada={(galones, total) =>
                    terminarSimulacion(venta.id, galones, total)
                  }
                />
              )}
              <Button
                size="small"
                onClick={() => finalizarVenta(venta.id, venta.galones, venta.total)}
                disabled={!venta.simulacionTerminada}
                sx={{ color: '#4caf50' }}
              >
                Finalizar
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Button variant="contained" onClick={abrirModalVenta} sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}>
        Iniciar Nueva Venta
      </Button>

      {/* Modal para iniciar nueva venta */}
      <Modal open={isVentaModalOpen} onClose={cerrarModalVenta}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32' }}>
            Iniciar Nueva Venta {clienteInfo.nombre && `- ${clienteInfo.nombre} ${clienteInfo.apellido}`}
          </Typography>

          <Button
            variant="outlined"
            onClick={() => setIsMangueraModalOpen(true)}
            sx={{ mb: 2, borderColor: '#4caf50', color: '#4caf50', '&:hover': { borderColor: '#388e3c', color: '#388e3c' } }}
          >
            {selectedManguera ? `${selectedLado} - ${selectedManguera.tipo_combustible}` : "Seleccionar Manguera"}
          </Button>

          <TextField
            label="Cédula del Cliente"
            name="cedula_cliente"
            value={formData.cedula_cliente}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={abrirBusquedaCliente}>
                    <SearchIcon sx={{ color: '#4caf50' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />

          {clienteInfo.placas.length > 0 ? (
            <FormControl fullWidth margin="normal">
              <InputLabel>Placa</InputLabel>
              <Select
                name="numero_placa"
                value={formData.numero_placa}
                onChange={handleChange}
              >
                {clienteInfo.placas.map((placa) => (
                  <MenuItem key={placa.id} value={placa.numero}>
                    {placa.numero}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Número de Placa"
              name="numero_placa"
              value={formData.numero_placa}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={abrirEscanerYBuscarPlaca}>
                      <CameraAltIcon sx={{ color: '#4caf50' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Servicio</InputLabel>
            <Select
              name="servicio"
              value={formData.servicio}
              onChange={handleChange}
            >
              {servicios.map((servicio) => (
                <MenuItem key={servicio.id} value={servicio.tipo}>
                  {servicio.tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Forma de Pago</InputLabel>
            <Select
              name="forma_pago"
              value={formData.forma_pago}
              onChange={handleChange}
            >
              {formasPago.map((pago) => (
                <MenuItem key={pago.id} value={pago.tipo}>
                  {pago.tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={() => iniciarVenta({ ...formData, tipo_manguera: selectedManguera.tipo_combustible })}
            disabled={!selectedManguera}
            sx={{ mt: 2, backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}
          >
            Iniciar Venta
          </Button>
        </Box>
      </Modal>

      {/* Modal para seleccionar manguera */}
      <Modal open={isMangueraModalOpen} onClose={() => setIsMangueraModalOpen(false)}>
        <Box sx={{ ...modalStyle, overflowY: "auto" }}>
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32' }}></Typography>
          <Lados onSeleccionManguera={handleSeleccionManguera} />
        </Box>
      </Modal>

      {/* Modal para escanear placa */}
      <Modal open={isEscanerModalOpen} onClose={() => setIsEscanerModalOpen(false)}>
        <Box sx={{ ...modalStyle, overflowY: "auto" }}>
          <Escaner onDatosDetectados={manejarDatosEscaner} placaManual={formData.numero_placa} />
        </Box>
      </Modal>

      {/* Modal para buscar cliente por cédula */}
      <Modal open={isClienteModalOpen} onClose={() => setIsClienteModalOpen(false)}>
        <Box sx={{ ...modalStyle, overflowY: "auto" }}>
          <VentaCliente cedulaInicial={formData.cedula_cliente} onClienteEncontrado={manejarDatosCliente} />
        </Box>
      </Modal>
    </Box>
  );
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxHeight: "90vh",
  maxWidth: "90vw",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

export default DespachoOperador;
