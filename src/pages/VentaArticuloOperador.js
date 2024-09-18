import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import VentaCliente from "../components/VentaCliente";
import config from '../config'; 

function VentaArticuloOperador() {
  const [perchas, setPerchas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedPercha, setSelectedPercha] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedCantidad, setSelectedCantidad] = useState(0);
  const [carrito, setCarrito] = useState([]);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isQuantityModalOpen, setQuantityModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [limpiarCliente, setLimpiarCliente] = useState(null);

  const fetchPerchasAsignadas = async () => {
    const gruposAsignados = JSON.parse(localStorage.getItem("gruposAsignados")) || [];
    const perchasAsignadas = [];
    for (const grupoId of gruposAsignados) {
      const response = await axios.get(`${config.apiUrl}/perchas/grupo/${grupoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      perchasAsignadas.push(...response.data);
    }
    setPerchas(perchasAsignadas);
  };

  useEffect(() => {
    fetchPerchasAsignadas();
  }, []);

  const handleOpenProductosModal = async (perchaId) => {
    const response = await axios.get(`${config.apiUrl}/productos/percha/${perchaId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setProductos(response.data);
    setSelectedPercha(perchaId);
    setProductModalOpen(true);
  };

  const handleSelectProducto = (producto) => {
    setSelectedProducto(producto);
    setProductModalOpen(false);
    setQuantityModalOpen(true);
  };

  const handleAddToCarrito = () => {
    const nuevoProducto = {
      ...selectedProducto,
      cantidadSeleccionada: selectedCantidad,
      precioTotal: selectedProducto.PrecioVentaPublico * selectedCantidad,
    };

    if (editIndex !== null) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[editIndex] = nuevoProducto;
      setCarrito(nuevoCarrito);
      setEditIndex(null);
    } else {
      setCarrito([...carrito, nuevoProducto]);
    }

    setQuantityModalOpen(false);
    setSelectedCantidad(0);
  };

  const handleEliminarProducto = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
  };

  const handleEditarProducto = (index) => {
    const producto = carrito[index];
    setSelectedProducto(producto);
    setSelectedCantidad(producto.cantidadSeleccionada);
    setEditIndex(index);
    setQuantityModalOpen(true);
  };

  const handleCancelarVenta = () => {
    setCarrito([]);
    setSelectedPercha(null);
  };

  const calcularTotalVenta = () => {
    return carrito.reduce((total, producto) => total + producto.precioTotal, 0);
  };

  const handleVender = async () => {
    const totalVenta = calcularTotalVenta();
    const idOperador = localStorage.getItem("id_operador");

    const venta = {
      id_operador: idOperador,
      totalVenta: totalVenta,
      id_estante: selectedPercha,
      cedula_cliente: clienteSeleccionado?.cedula,
      fecha: new Date().toISOString(),
      productos: carrito.map(({ id, cantidadSeleccionada, precioTotal }) => ({
        id_producto: id,
        cantidad: cantidadSeleccionada,
        total_producto: precioTotal,
      })),
    };

    try {
      const response = await axios.post(`${config.apiUrl}/venta_articulo`, venta, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("Venta realizada con éxito");

      setCarrito([]);
      setSelectedPercha(null);
      setClienteSeleccionado(null);
      setProductos([]);
      setSelectedProducto(null);
      setSelectedCantidad(0);

      if (limpiarCliente) {
        limpiarCliente();
      }
    } catch (error) {
      console.error("Error al realizar la venta", error);
    }
  };

  return (
    <Box>
      <VentaCliente
        onClienteEncontrado={setClienteSeleccionado}
        onLimpiar={(limpiarFn) => setLimpiarCliente(() => limpiarFn)}
      />

      <Typography variant="h5" gutterBottom sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32', fontWeight: 'bold' }}>
        Perchas Asignadas
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {perchas.map((percha) => (
          <Button
            key={percha.id}
            variant="outlined"
            onClick={() => handleOpenProductosModal(percha.id)}
            disabled={!!selectedPercha && selectedPercha !== percha.id}
            sx={{ borderColor: '#4caf50', color: '#4caf50', '&:hover': { borderColor: '#388e3c', color: '#388e3c' } }}
          >
            {percha.nombre}
          </Button>
        ))}
      </Box>

      {carrito.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 'bold' }}>Carrito</Typography>
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Unitario ($)</TableCell>
                  <TableCell align="right">Total ($)</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {carrito.map((producto, idx) => (
                  <TableRow key={idx}>
                    <TableCell component="th" scope="row">
                      {producto.ConceptoProducto}
                    </TableCell>
                    <TableCell align="right">{producto.cantidadSeleccionada}</TableCell>
                    <TableCell align="right">{producto.PrecioVentaPublico.toFixed(2)}</TableCell>
                    <TableCell align="right">{producto.precioTotal.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEditarProducto(idx)}>
                        <EditIcon sx={{ color: '#4caf50' }} />
                      </IconButton>
                      <IconButton onClick={() => handleEliminarProducto(idx)}>
                        <DeleteIcon sx={{ color: '#e53935' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="subtitle1"><strong>Total Venta:</strong></Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1"><strong>${calcularTotalVenta().toFixed(2)}</strong></Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleVender} sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}>
              Vender
            </Button>
            <Button variant="outlined" onClick={handleCancelarVenta} sx={{ borderColor: '#e53935', color: '#e53935', '&:hover': { borderColor: '#d32f2f', color: '#d32f2f' } }}>
              Cancelar Venta
            </Button>
          </Box>
        </Box>
      )}

      <Modal open={isProductModalOpen} onClose={() => setProductModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32' }}>Productos en la Percha</Typography>
          <List>
            {productos.map((producto) => (
              <ListItem key={producto.id} button onClick={() => handleSelectProducto(producto)}>
                <ListItemText
                  primary={producto.ConceptoProducto}
                  secondary={`Stock: ${producto.StockActual} | Precio: $${producto.PrecioVentaPublico}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>

      <Modal open={isQuantityModalOpen} onClose={() => setQuantityModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" sx={{ fontFamily: "Poppins, sans-serif", color: '#2e7d32' }}>Selecciona la Cantidad</Typography>
          <TextField
            type="number"
            label="Cantidad"
            value={selectedCantidad}
            onChange={(e) => setSelectedCantidad(Number(e.target.value))}
            fullWidth
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <Button variant="contained" onClick={handleAddToCarrito} sx={{ mt: 2, backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}>
            Añadir al Carrito
          </Button>
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
  overflowY: 'auto',
};

export default VentaArticuloOperador;
