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
} from "@mui/material";
import axios from "axios";
import Simulador from "../components/Simulador";
import Lados from "../components/Lados";

  // Obtener la fecha actual en formato YYYY-MM-DD
  const getFechaActual = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

function DespachoOperador() {
  const [ventasActivas, setVentasActivas] = useState([]);
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);
  const [isMangueraModalOpen, setIsMangueraModalOpen] = useState(false);
  const [selectedManguera, setSelectedManguera] = useState(null);
  const [selectedLado, setSelectedLado] = useState(null);

  const [formasPago, setFormasPago] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [formData, setFormData] = useState({
    tipo_manguera: "",
    cedula_cliente: "",
    numero_placa: "",
    servicio: "",
    forma_pago: "",
    fecha: getFechaActual(), // Inicializa con la fecha actual
  });

  // Cargar las formas de pago y los servicios al montar el componente
  useEffect(() => {
    cargarFormasPago();
    cargarServicios();
    cargarVentasActivas();
  }, []);

  const cargarFormasPago = async () => {
    try {
      const response = await axios.get("http://localhost:5000/formapagos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFormasPago(response.data);
      setFormData((prevFormData) => ({
        ...prevFormData,
        forma_pago: response.data[0]?.tipo || "", // Seleccionar la primera opción
      }));
    } catch (error) {
      console.error("Error al cargar las formas de pago", error);
    }
  };

  const cargarServicios = async () => {
    try {
      const response = await axios.get("http://localhost:5000/servicios", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setServicios(response.data);
      setFormData((prevFormData) => ({
        ...prevFormData,
        servicio: response.data[0]?.tipo || "", // Seleccionar la primera opción
      }));
    } catch (error) {
      console.error("Error al cargar los servicios", error);
    }
  };

  const cargarVentasActivas = async () => {
    try {
      const response = await axios.get("http://localhost:5000/ventas_activas", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVentasActivas(response.data);
    } catch (error) {
      console.error("Error al cargar las ventas activas", error);
    }
  };

const iniciarVenta = async (ventaData) => {
  try {
    // Obtener el ID del operador desde el localStorage
    const id_operador = localStorage.getItem("id_operador");

    // Agregar el id_operador al objeto de datos de la venta
    const ventaConOperador = { ...ventaData, id_operador };

    // Realizar el POST de la venta con el id_operador
    const response = await axios.post("http://localhost:5000/venta_gasolina", ventaConOperador, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const nuevaVenta = {
      ...ventaConOperador,
      id: response.data.id,
      galones: 0,
      total: 0,
      estado: true,
      simulacionTerminada: false,
      lado: selectedLado, // Almacenar el lado seleccionado
      tipo_manguera: selectedManguera?.tipo_combustible, // Almacenar el tipo de manguera
    };

    setVentasActivas([...ventasActivas, nuevaVenta]);
    setIsVentaModalOpen(false); // Cerrar el modal después de iniciar la venta
  } catch (error) {
    console.error("Error al iniciar la venta", error);
  }
};


  const finalizarVenta = async (id, galones, total) => {
    try {
      await axios.put(
        `http://localhost:5000/venta_gasolina/${id}/finalizar`,
        { galones, total, fecha: new Date() },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      cargarVentasActivas(); // Recargar la lista de ventas activas tras finalizar
    } catch (error) {
      console.error("Error al finalizar la venta", error);
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

  const abrirModalVenta = () => {
    setFormData({
      tipo_manguera: "",
      cedula_cliente: "",
      numero_placa: "",
      servicio: servicios[0]?.tipo || "", // Seleccionar el primer servicio
      forma_pago: formasPago[0]?.tipo || "", // Seleccionar la primera forma de pago
      fecha: getFechaActual(),
    });
    setSelectedManguera(null);
    setSelectedLado(null);
    setIsVentaModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSeleccionManguera = (manguera, lado) => {
    setSelectedManguera(manguera);
    setSelectedLado(lado); // Almacenar el lado
    setIsMangueraModalOpen(false); // Cerrar el modal al seleccionar
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Ventas Activas
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        {ventasActivas.map((venta) => (
          <Card
            key={venta.id}
            sx={{
              width: 200,
              border: venta.simulacionTerminada ? "3px solid green" : "1px solid grey",
            }}
          >
            <CardContent>
              <Typography variant="h6">
                {venta.lado} - {venta.tipo_manguera}
              </Typography>
              <Typography variant="body2">Cliente: {venta.cedula_cliente}</Typography>
              <Typography variant="body2">Placa: {venta.numero_placa}</Typography>
              <Typography variant="body2">Galones: {venta.galones}</Typography>
              <Typography variant="body2">Total: ${venta.total}</Typography>
              <Typography variant="body2">Fecha: {venta.fecha}</Typography>
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
              >
                Finalizar
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Button variant="contained" onClick={abrirModalVenta}>
        Iniciar Nueva Venta
      </Button>

      <Modal open={isVentaModalOpen} onClose={() => setIsVentaModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6">Iniciar Nueva Venta</Typography>

          <Button
            variant="outlined"
            onClick={() => setIsMangueraModalOpen(true)}
            sx={{ mb: 2 }}
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
          />
          <TextField
            label="Número de Placa"
            name="numero_placa"
            value={formData.numero_placa}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

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

          <TextField
            label="Fecha"
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => iniciarVenta({ ...formData, tipo_manguera: selectedManguera.tipo_combustible })}
            disabled={!selectedManguera} // Deshabilitar si no se ha seleccionado una manguera
            sx={{ mt: 2 }}
          >
            Iniciar Venta
          </Button>
        </Box>
      </Modal>

      {/* Modal para seleccionar manguera */}
      <Modal open={isMangueraModalOpen} onClose={() => setIsMangueraModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6">Seleccionar Manguera</Typography>
          <Lados onSeleccionManguera={handleSeleccionManguera} />
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
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default DespachoOperador;
