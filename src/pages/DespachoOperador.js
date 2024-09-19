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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import GavelIcon from '@mui/icons-material/Gavel';
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
  const [isCuantiaModalOpen, setIsCuantiaModalOpen] = useState(false);
  const [selectedManguera, setSelectedManguera] = useState(null);
  const [selectedLado, setSelectedLado] = useState(null);
  const [clienteInfo, setClienteInfo] = useState({ nombre: "", apellido: "", placas: [] });
  const [formasPago, setFormasPago] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [sriPagos, setSriPagos] = useState([]);
  const [formData, setFormData] = useState({
    tipo_manguera: "",
    cedula_cliente: "",
    numero_placa: "",
    servicio_id: "",
    FormaPago_id: "",
    SriPagos_id: "",
    NumeroCuantia: "",
    codigoVerificacion: "",
  });
  const [sinPlaca, setSinPlaca] = useState(false);
  const [codigoValidado, setCodigoValidado] = useState(false);

  useEffect(() => {
    cargarFormasPago();
    cargarServicios();
    cargarSriPagos();
    cargarVentasActivas();
  }, []);

  const cargarFormasPago = async (despachoSiNo) => {
    try {
      const response = await axios.get(`${config.apiUrl}/formapagos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const formasFiltradas = despachoSiNo ? response.data : response.data.filter((p) => p.id === 1);
      setFormasPago(formasFiltradas);
      setFormData((prevFormData) => ({
        ...prevFormData,
        FormaPago_id: formasFiltradas[0]?.id || "",
      }));
    } catch (error) {
      console.error("Error al cargar las formas de pago", error);
    }
  };

  const buscarCliente = async (cedula) => {
    try {
      const response = await axios.get(`${config.apiUrl}/cliente/cedula/${cedula}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      manejarDatosCliente(response.data);
    } catch (error) {
      console.error("Error al buscar el cliente:", error);
    }
  };

  const cargarServicios = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/servicios`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setServicios(response.data);
      setFormData((prevFormData) => ({
        ...prevFormData,
        servicio_id: response.data[0]?.id || "",
      }));
    } catch (error) {
      console.error("Error al cargar los servicios", error);
    }
  };

  const cargarSriPagos = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/sripagos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSriPagos(response.data);
      setFormData((prevFormData) => ({
        ...prevFormData,
        SriPagos_id: response.data[0]?.id || "",
      }));
    } catch (error) {
      console.error("Error al cargar los pagos SRI", error);
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

  const iniciarVenta = async () => {
    try {
      const id_operador = localStorage.getItem("id_operador");
      const ventaConOperador = { ...formData, id_operador, fecha: getFechaActual(), tipo_manguera: selectedManguera.tipo_combustible };

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
      };

      setVentasActivas([...ventasActivas, nuevaVenta]);
      cerrarModalVenta();
    } catch (error) {
      console.error("Error al iniciar la venta", error);
    }
  };

  const finalizarVenta = async (id, galones, total, iva) => {
    try {
      await axios.put(
        `${config.apiUrl}/venta_gasolina/${id}/finalizar`,
        { galones, total, iva, fecha: getFechaActual() },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      cargarVentasActivas();
    } catch (error) {
      console.error("Error al finalizar la venta", error);
    }
  };

  const terminarSimulacion = (id, galones, total, iva) => {
    setVentasActivas((prevVentas) =>
      prevVentas.map((venta) =>
        venta.id === id
          ? { ...venta, galones, total, iva, simulacionTerminada: true }
          : venta
      )
    );
  };

  const cerrarModalVenta = () => {
    setFormData({
      tipo_manguera: "",
      cedula_cliente: "",
      numero_placa: "",
      servicio_id: "",
      FormaPago_id: "",
      SriPagos_id: "",
      NumeroCuantia: "",
      codigoVerificacion: "",
    });
    setClienteInfo({ nombre: "", apellido: "", placas: [] });
    setSinPlaca(false);
    setIsVentaModalOpen(false);
  };

  const abrirModalVenta = () => {
    setFormData({
      tipo_manguera: "",
      cedula_cliente: "",
      numero_placa: "",
      servicio_id: servicios[0]?.id || "",
      FormaPago_id: formasPago[0]?.id || "",
      SriPagos_id: sriPagos[0]?.id || "",
      NumeroCuantia: "",
      codigoVerificacion: "",
    });
    setSelectedManguera(null);
    setSelectedLado(null);
    setIsVentaModalOpen(true);
  };

  const abrirEscanerYBuscarPlaca = () => {
    setIsEscanerModalOpen(true);
  };

  const abrirBusquedaCliente = () => {
    setIsClienteModalOpen(true);
  };

  const manejarDatosEscaner = ({ placa, cedula, nombre, apellido, NumeroCuantia, EntidadPublica, codigo, placas }) => {
    // Log para ver los datos que devuelve el escáner
    console.log("Datos del escáner:", {
      placa,
      cedula,
      nombre,
      apellido,
      NumeroCuantia,
      EntidadPublica,
      codigo,
      placas
    });
  
    setClienteInfo({ nombre, apellido, placas, EntidadPublica, codigo });
    setFormData((prevFormData) => ({
      ...prevFormData,
      numero_placa: placa,
      cedula_cliente: cedula,
      NumeroCuantia: NumeroCuantia || "",
    }));
    validarServicioCliente({ EntidadPublica, NumeroCuantia });
    setIsEscanerModalOpen(false);
  };
  
  

  const manejarDatosCliente = (clienteData) => {
    const clienteTienePlacas = clienteData.placas.length > 0;
    setClienteInfo({
      nombre: clienteData.nombre,
      apellido: clienteData.apellido,
      placas: clienteData.placas || [],
      EntidadPublica: clienteData.EntidadPublica,
      codigo: clienteData.codigo,
    });
    setFormData((prevFormData) => ({
      ...prevFormData,
      cedula_cliente: clienteData.cedula,
      numero_placa: clienteTienePlacas ? clienteData.placas[0].numero : "",
      NumeroCuantia: clienteData.NumeroCuantia || "",
    }));
    cargarFormasPago(clienteData.DespachoSiNo);
    validarServicioCliente(clienteData);
    setIsClienteModalOpen(false);
  };

  const validarServicioCliente = (clienteData) => {
    const servicioSeleccionado = servicios.find((servicio) => servicio.id === formData.servicio_id);
    
    if (servicioSeleccionado.tipo === "Cuantia Domestica") {
      if (!clienteData.NumeroCuantia) {
        const confirmar = window.confirm("Este cliente no tiene una cuantía registrada. ¿Deseas agregarla?");
        if (confirmar) {
          setIsCuantiaModalOpen(true);
        } else {
          cambiarServicioAVentaNormal();
        }
      }
    } else if ((servicioSeleccionado.tipo === "Calibracion" || servicioSeleccionado.tipo === "Calibracion con Dev") && !clienteData.EntidadPublica) {
      alert("Este cliente no puede realizar la calibración.");
      cambiarServicioAVentaNormal();
    }
  };
  
  const cambiarServicioAVentaNormal = () => {
    if (servicios.find((servicio) => servicio.id === formData.servicio_id)?.tipo !== "Consumidor Final") {
      const ventaNormal = servicios.find((servicio) => servicio.tipo === "Venta Normal");
      setFormData((prevFormData) => ({ ...prevFormData, servicio_id: ventaNormal?.id || "" }));
    }
  };

  const handleServicioChange = (e) => {
    const servicioSeleccionado = servicios.find((servicio) => servicio.id === e.target.value);
  
    if (servicioSeleccionado.tipo === "Consumidor Final") {
      // Mantener el servicio como "Consumidor Final" y abrir el escáner si es necesario
      setFormData((prevFormData) => ({
        ...prevFormData,
        servicio_id: servicioSeleccionado.id,
        numero_placa: "ZZZ9999", 
      }));
      abrirEscanerYBuscarPlaca();
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        servicio_id: servicioSeleccionado.id
      }));
    }
  
    if (servicioSeleccionado.tipo.includes("Calibracion")) {
      setCodigoValidado(false);
      if (!clienteInfo.EntidadPublica) {
        alert("Este cliente no puede realizar la calibración.");
        cambiarServicioAVentaNormal();
      }
    }
  };
  
  const actualizarCuantiaCliente = async (cuantia) => {
    try {
      await axios.put(
        `${config.apiUrl}/cliente/${formData.cedula_cliente}`,
        { NumeroCuantia: cuantia },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setFormData((prevFormData) => ({ ...prevFormData, NumeroCuantia: cuantia }));
      setIsCuantiaModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar la cuantía del cliente:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSeleccionManguera = (manguera, lado) => {
    setSelectedManguera(manguera);
    setSelectedLado(lado);
    setIsMangueraModalOpen(false);
  };

  const handleSinPlacaChange = (e) => {
    const checked = e.target.checked;
    setSinPlaca(checked);
    setFormData((prevFormData) => ({
      ...prevFormData,
      numero_placa: checked ? "ZZZ9999" : "",
    }));
  };


  const validarCodigo = () => {
    if (formData.codigoVerificacion === clienteInfo.codigo) {
      setCodigoValidado(true);
      alert("Código validado correctamente");
    } else {
      setCodigoValidado(false);
      alert("Código incorrecto, intenta nuevamente.");
    }
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
              <Typography variant="body2">Fecha: {new Date(venta.fecha).toLocaleString()}</Typography>
            </CardContent>
            <CardActions>
              {!venta.simulacionTerminada && (
                <Simulador
                  venta={venta}
                  onSimulacionTerminada={(galones, total, iva) =>
                    terminarSimulacion(venta.id, galones, total, iva)
                  }
                />
              )}
              <Button
                size="small"
                onClick={() => finalizarVenta(venta.id, venta.galones, venta.total, venta.iva)}
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

          <FormControl fullWidth margin="normal">
            <InputLabel>Servicio</InputLabel>
            <Select
              name="servicio_id"
              value={formData.servicio_id}
              onChange={handleServicioChange}
            >
              {servicios.map((servicio) => (
                <MenuItem key={servicio.id} value={servicio.id}>
                  {servicio.tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Mostrar campo de cuantía si se selecciona "Cuantia Domestica" */}
          {servicios.find((servicio) => servicio.id === formData.servicio_id)?.tipo === "Cuantia Domestica" && (
            <TextField
              label="Cuantía"
              name="NumeroCuantia"
              value={formData.NumeroCuantia}
              onChange={(e) => setFormData({ ...formData, NumeroCuantia: e.target.value })}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => actualizarCuantiaCliente(formData.NumeroCuantia)}>
                      <ArrowForwardIcon sx={{ color: '#4caf50' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}


          {/* Mostrar campo de código si se selecciona "Calibracion" o "Calibracion con Dev" y el cliente es EntidadPublica */}
          {(servicios.find((servicio) => servicio.id === formData.servicio_id)?.tipo === "Calibracion" ||
            servicios.find((servicio) => servicio.id === formData.servicio_id)?.tipo === "Calibracion con Dev") &&
            clienteInfo.EntidadPublica && (
              <TextField
                label="Código Verificación"
                name="codigoVerificacion"
                value={formData.codigoVerificacion}
                onChange={(e) => setFormData({ ...formData, codigoVerificacion: e.target.value })}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={validarCodigo}>
                        {codigoValidado ? <CheckIcon sx={{ color: '#4caf50' }} /> : <GavelIcon sx={{ color: '#4caf50' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

            )}

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

          <FormControlLabel
            control={
              <Checkbox
                checked={sinPlaca}
                onChange={handleSinPlacaChange}
              />
            }
            label="Sin Placa"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Forma de Pago</InputLabel>
            <Select
              name="FormaPago_id"
              value={formData.FormaPago_id}
              onChange={handleChange}
            >
              {formasPago.map((pago) => (
                <MenuItem key={pago.id} value={pago.id}>
                  {pago.tipo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Forma de Pago SRI</InputLabel>
            <Select
              name="SriPagos_id"
              value={formData.SriPagos_id}
              onChange={handleChange}
            >
              {sriPagos.map((pago) => (
                <MenuItem key={pago.id} value={pago.id}>
                  {pago.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => setIsMangueraModalOpen(true)}
            sx={{ mb: 2, borderColor: '#4caf50', color: '#4caf50', '&:hover': { borderColor: '#388e3c', color: '#388e3c' } }}
          >
            {selectedManguera ? `${selectedLado} - ${selectedManguera.tipo_combustible}` : "Seleccionar Manguera"}
          </Button>

          <Button
            variant="contained"
            onClick={iniciarVenta}
            disabled={!selectedManguera || (servicios.find(servicio => servicio.id === formData.servicio_id)?.tipo.includes("Calibracion") && !codigoValidado)} // No permite iniciar si no está validado
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

