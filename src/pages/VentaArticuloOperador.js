import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemSecondaryAction,
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
      perchasAsignadas.push(...response.data); // Concatenar perchas
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
    setSelectedPercha(perchaId); // Bloquea las demás perchas
    setProductModalOpen(true);
  };

  // Seleccionar un producto para añadir al carrito
  const handleSelectProducto = (producto) => {
    setSelectedProducto(producto);
    setProductModalOpen(false); // Cerrar modal de productos
    setQuantityModalOpen(true); // Abrir modal para cantidad
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

    setQuantityModalOpen(false); // Cerrar modal de cantidad
    setSelectedCantidad(0); // Resetear cantidad
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
      cedula_cliente: clienteSeleccionado?.cedula,  // Cambiar a 'cedula_cliente'
      productos: carrito.map(({ id, cantidadSeleccionada, precioTotal }) => ({
        id_producto: id,
        cantidad: cantidadSeleccionada,
        total_producto: precioTotal,
      })),
    };
  
    // Log para verificar los datos antes de enviar al backend
    console.log("Datos a enviar:", venta);
  
    try {
      // Enviar la venta al backend
      const response = await axios.post("http://localhost:5000/venta_articulo", venta, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      alert("Venta realizada con éxito");
      
      // Limpiar todos los campos
      setCarrito([]);  // Limpiar carrito
      setSelectedPercha(null);  // Desbloquear perchas
      setClienteSeleccionado(null);  // Limpiar cliente seleccionado
      setProductos([]);  // Limpiar productos de la percha
      setSelectedProducto(null);  // Limpiar producto seleccionado
      setSelectedCantidad(0);  // Resetear cantidad
    } catch (error) {
      console.error("Error al realizar la venta", error);
    }
};

  // Manejar la cancelación de la venta
  const handleCancelarVenta = () => {
    setCarrito([]);
    setSelectedPercha(null); // Desbloquear las perchas
  };

  return (
    <Box>
      {/* Componente para seleccionar cliente */}
      <VentaCliente
        onClienteEncontrado={setClienteSeleccionado} // Guardar cliente seleccionado
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
            disabled={!!selectedPercha && selectedPercha !== percha.id} // Bloquear perchas no seleccionadas
          >
            {percha.nombre}
          </Button>
        ))}
      </Box>

      {/* Carrito de productos seleccionados */}
      <Typography variant="h6">Carrito</Typography>
      <List>
        {carrito.map((producto, idx) => (
          <ListItem key={idx}>
            <ListItemText
              primary={`${producto.nombre} - ${producto.cantidadSeleccionada} unidades`}
              secondary={`Precio unitario: $${producto.precio} | Total: $${producto.precioTotal}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleEditarProducto(idx)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleEliminarProducto(idx)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {carrito.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            <strong>Total Venta: ${calcularTotalVenta()}</strong>
          </Typography>
          <Button variant="contained" color="primary" onClick={handleVender} sx={{ mt: 2 }}>
            Vender
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancelarVenta} sx={{ mt: 2 }}>
            Cancelar Venta
          </Button>
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
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default VentaArticuloOperador;
