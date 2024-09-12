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
  ListItemSecondaryAction
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

function VentaArticuloOperador() {
  const [perchas, setPerchas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedPercha, setSelectedPercha] = useState(null);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedCantidad, setSelectedCantidad] = useState(0);
  const [carrito, setCarrito] = useState([]); // Aquí se almacenarán los productos seleccionados
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isQuantityModalOpen, setQuantityModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // Para modificar la cantidad de un producto

  // Obtener las perchas asignadas al operador
  const fetchPerchasAsignadas = async () => {
    const gruposAsignados = JSON.parse(localStorage.getItem("gruposAsignados")) || [];
    
    const perchasAsignadas = [];
    for (const grupoId of gruposAsignados) {
      const response = await axios.get(`http://localhost:5000/perchas/grupo/${grupoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      perchasAsignadas.push(...response.data); // Concatenar las perchas de cada grupo
    }
    
    setPerchas(perchasAsignadas);
  };

  useEffect(() => {
    fetchPerchasAsignadas();
  }, []);

  // Abrir modal con productos de una percha
  const handleOpenProductosModal = async (perchaId) => {
    const response = await axios.get(`http://localhost:5000/productos/percha/${perchaId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setProductos(response.data);
    setSelectedPercha(perchaId);
    setProductModalOpen(true);
  };

  // Seleccionar un producto para añadir o editar cantidad
  const handleSelectProducto = (producto) => {
    setSelectedProducto(producto);
    setProductModalOpen(false); // Cerrar el modal de productos
    setQuantityModalOpen(true); // Abrir el modal para seleccionar la cantidad
  };

  // Añadir o actualizar el producto con la cantidad seleccionada al carrito
  const handleAddToCarrito = () => {
    const nuevoProducto = {
      ...selectedProducto,
      cantidadSeleccionada: selectedCantidad,
      precioTotal: selectedProducto.precio * selectedCantidad,
    };

    // Si estamos editando un producto, reemplazamos el producto en esa posición
    if (editIndex !== null) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[editIndex] = nuevoProducto;
      setCarrito(nuevoCarrito);
      setEditIndex(null); // Reiniciar el índice de edición
    } else {
      setCarrito([...carrito, nuevoProducto]); // Añadir al carrito
    }

    setQuantityModalOpen(false); // Cerrar el modal de cantidad
    setSelectedCantidad(0); // Resetear cantidad seleccionada
  };

  // Eliminar un producto del carrito
  const handleEliminarProducto = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
  };

  // Editar un producto del carrito
  const handleEditarProducto = (index) => {
    const producto = carrito[index];
    setSelectedProducto(producto); // Seteamos el producto a editar
    setSelectedCantidad(producto.cantidadSeleccionada); // Cargamos la cantidad actual
    setEditIndex(index); // Guardamos el índice del producto a editar
    setQuantityModalOpen(true); // Abrimos el modal de cantidad
  };

  // Calcular el valor total de la venta
  const calcularTotalVenta = () => {
    return carrito.reduce((total, producto) => total + producto.precioTotal, 0);
  };

  // Función para vender
  const handleVender = async () => {
    const totalVenta = calcularTotalVenta(); // Calcula el total de la venta
    const venta = {
      productos: carrito.map(({ id, nombre, cantidadSeleccionada, precio, precioTotal }) => ({
        id_producto: id,
        nombre: nombre,
        cantidad: cantidadSeleccionada,
        precio_unitario: precio,
        total_producto: precioTotal, // Total por producto
      })),
      totalVenta: totalVenta, // Agrega el total de la venta al JSON
    };

    alert(JSON.stringify(venta, null, 2)); // Mostrar el JSON con toda la venta

    try {
      for (const producto of carrito) {
        // Actualizar la cantidad de cada producto en el backend
        await axios.put(
          `http://localhost:5000/producto/${producto.id}`,
          {
            cantidad: producto.cantidad - producto.cantidadSeleccionada, // Actualizar cantidad
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
      }

      // Limpiar el carrito después de vender
      setCarrito([]);
    } catch (error) {
      console.error("Error al vender productos", error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Perchas Asignadas
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {perchas.map((percha) => (
          <Button
            key={percha.id}
            variant="outlined"
            onClick={() => handleOpenProductosModal(percha.id)}
          >
            {percha.nombre}
          </Button>
        ))}
      </Box>

      {/* Mostrar productos seleccionados */}
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
        </Box>
      )}

      {/* Modal de productos */}
      <Modal open={isProductModalOpen} onClose={() => setProductModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6">Productos en la Percha</Typography>
          <List>
            {productos.map((producto) => (
              <ListItem button key={producto.id} onClick={() => handleSelectProducto(producto)}>
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
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default VentaArticuloOperador;
