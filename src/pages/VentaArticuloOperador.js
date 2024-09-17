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
import VentaCliente from "../components/VentaCliente"; // Componente para seleccionar cliente

function VentaArticuloOperador() {
  const [perchas, setPerchas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedPercha, setSelectedPercha] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedCantidad, setSelectedCantidad] = useState(0);
  const [carrito, setCarrito] = useState([]); // Productos seleccionados
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isQuantityModalOpen, setQuantityModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // Para editar la cantidad de un producto
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // Cliente seleccionado

  // Obtener perchas asignadas
  const fetchPerchasAsignadas = async () => {
    const gruposAsignados = JSON.parse(localStorage.getItem("gruposAsignados")) || [];
    const perchasAsignadas = [];
    for (const grupoId of gruposAsignados) {
      const response = await axios.get(`http://localhost:5000/perchas/grupo/${grupoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      perchasAsignadas.push(...response.data);
    }
    setPerchas(perchasAsignadas);
  };

  useEffect(() => {
    fetchPerchasAsignadas();
  }, []);

  // Abrir modal con productos de la percha seleccionada y bloquear las otras
  const handleOpenProductosModal = async (perchaId) => {
    const response = await axios.get(`http://localhost:5000/productos/percha/${perchaId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setProductos(response.data);
    setSelectedPercha(perchaId);
    setProductModalOpen(true);
  };

  // Seleccionar un producto para añadir al carrito
  const handleSelectProducto = (producto) => {
    setSelectedProducto(producto);
    setProductModalOpen(false);
    setQuantityModalOpen(true);
  };

  // Añadir o actualizar el producto en el carrito
  const handleAddToCarrito = () => {
    const nuevoProducto = {
      ...selectedProducto,
      cantidadSeleccionada: selectedCantidad,
      precioTotal: selectedProducto.precio * selectedCantidad,
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

  // Eliminar producto del carrito
  const handleEliminarProducto = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
  };

  // Editar producto en el carrito
  const handleEditarProducto = (index) => {
    const producto = carrito[index];
    setSelectedProducto(producto);
    setSelectedCantidad(producto.cantidadSeleccionada);
    setEditIndex(index);
    setQuantityModalOpen(true);
  };

  // Manejar la cancelación de la venta
  const handleCancelarVenta = () => {
    setCarrito([]);
    setSelectedPercha(null); // Desbloquear las perchas
  };

  // Calcular total de la venta
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
      fecha: new Date().toISOString(), // Fecha y hora actual en formato ISO 8601
      productos: carrito.map(({ id, cantidadSeleccionada, precioTotal }) => ({
        id_producto: id,
        cantidad: cantidadSeleccionada,
        total_producto: precioTotal,
      })),
    };

    try {
      const response = await axios.post("http://localhost:5000/venta_articulo", venta, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("Venta realizada con éxito");
      
      // Limpiar todos los campos
      setCarrito([]);
      setSelectedPercha(null);
      setClienteSeleccionado(null);
      setProductos([]);
      setSelectedProducto(null);
      setSelectedCantidad(0);
      
      // Llamar a la función de limpieza en el componente VentaCliente
      if (limpiarCliente) {
        limpiarCliente();
      }
    } catch (error) {
      console.error("Error al realizar la venta", error);
    }
  };

  // Función para recibir la función de limpieza desde VentaCliente
  const [limpiarCliente, setLimpiarCliente] = useState(null);

  return (
    <Box>
      <VentaCliente
        onClienteEncontrado={setClienteSeleccionado}
        onLimpiar={(limpiarFn) => setLimpiarCliente(() => limpiarFn)}
      />

      <Typography variant="h5" gutterBottom>
        Perchas Asignadas
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {perchas.map((percha) => (
          <Button
            key={percha.id}
            variant="outlined"
            onClick={() => handleOpenProductosModal(percha.id)}
            disabled={!!selectedPercha && selectedPercha !== percha.id}
          >
            {percha.nombre}
          </Button>
        ))}
      </Box>

      {carrito.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Carrito</Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                      {producto.nombre}
                    </TableCell>
                    <TableCell align="right">{producto.cantidadSeleccionada}</TableCell>
                    <TableCell align="right">{producto.precio.toFixed(2)}</TableCell>
                    <TableCell align="right">{producto.precioTotal.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEditarProducto(idx)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEliminarProducto(idx)}>
                        <DeleteIcon />
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
            <Button variant="contained" color="primary" onClick={handleVender}>
              Vender
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancelarVenta}>
              Cancelar Venta
            </Button>
          </Box>
        </Box>
      )}

      {/* Modal de productos */}
      <Modal open={isProductModalOpen} onClose={() => setProductModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6">Productos en la Percha</Typography>
          <List>
            {productos.map((producto) => (
              <ListItem key={producto.id} button onClick={() => handleSelectProducto(producto)}>
                <ListItemText
                  primary={producto.nombre}
                  secondary={`Cantidad: ${producto.cantidad} | Precio: $${producto.precio}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>

      {/* Modal para seleccionar cantidad */}
      <Modal open={isQuantityModalOpen} onClose={() => setQuantityModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6">Selecciona la Cantidad</Typography>
          <TextField
            type="number"
            label="Cantidad"
            value={selectedCantidad}
            onChange={(e) => setSelectedCantidad(Number(e.target.value))}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleAddToCarrito} sx={{ mt: 2 }}>
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
  p: 4,
  overflowY: 'auto',
};

export default VentaArticuloOperador;
