import React, { useState, useEffect } from "react";
import {
  Fab,
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CrudTable from "../components/CrudTable";
import axios from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function ProductoCrud() {
  const [productos, setProductos] = useState([]);
  const [perchas, setPerchas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [newProducto, setNewProducto] = useState({
    nombre: "",
    precio: "",
    cantidad: "",
    id_percha: "",
  });
  const [editProducto, setEditProducto] = useState({
    nombre: "",
    precio: "",
    cantidad: "",
    id_percha: "",
  });

  // Obtener la lista de productos y perchas
  const fetchProductos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/productos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos", error);
    }
  };

  const fetchPerchas = async () => {
    try {
      const response = await axios.get("http://localhost:5000/perchas", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPerchas(response.data);
    } catch (error) {
      console.error("Error al cargar perchas", error);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchPerchas();
  }, []);

  // Abrir/Cerrar modales
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenEditModal = (producto) => {
    setEditProducto(producto);
    setEditModal(true);
  };
  const handleCloseEditModal = () => setEditModal(false);

  // Manejar cambios en los formularios
  const handleChange = (setter) => (e) => {
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Crear un nuevo producto
  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/producto", newProducto, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProductos();
      handleCloseModal();
      setNewProducto({
        nombre: "",
        precio: "",
        cantidad: "",
        id_percha: "",
      });
    } catch (error) {
      console.error("Error al crear producto", error);
    }
  };

  // Actualizar un producto existente
  const handleEditSubmitProducto = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/producto/${editProducto.id}`, editProducto, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProductos();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error al actualizar producto", error);
    }
  };

  // Eliminar un producto
  const handleDeleteProducto = async (producto) => {
    try {
      await axios.delete(`http://localhost:5000/producto/${producto.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  return (
    <div>
      <h2>CRUD de Productos</h2>

      {/* Botón para agregar producto */}
      <Fab color="primary" aria-label="add" onClick={handleOpenModal} style={{ marginBottom: "20px" }}>
        <AddIcon />
      </Fab>

      {/* Tabla de productos */}
      <CrudTable
        columns={[
          { title: "Nombre del Producto", field: "nombre" },
          { title: "Precio", field: "precio" },
          { title: "Cantidad", field: "cantidad" },
          {
            title: "Percha Asignada",
            field: "percha",
            render: (rowData) => (rowData.percha ? rowData.percha.nombre : "Sin Percha"),
          },
        ]}
        data={productos}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteProducto}
      />

      {/* Modal para agregar nuevo producto */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={style} component="form" onSubmit={handleSubmitProducto}>
          <Typography variant="h6" component="h2" gutterBottom>
            Agregar Nuevo Producto
          </Typography>

          <TextField
            label="Nombre del Producto"
            name="nombre"
            fullWidth
            value={newProducto.nombre}
            onChange={handleChange(setNewProducto)}
            margin="normal"
            required
          />
          <TextField
            label="Precio"
            name="precio"
            fullWidth
            value={newProducto.precio}
            onChange={handleChange(setNewProducto)}
            margin="normal"
            required
          />
          <TextField
            label="Cantidad"
            name="cantidad"
            fullWidth
            value={newProducto.cantidad}
            onChange={handleChange(setNewProducto)}
            margin="normal"
            required
          />
          <TextField
            select
            label="Percha Asignada"
            name="id_percha"
            fullWidth
            value={newProducto.id_percha}
            onChange={handleChange(setNewProducto)}
            margin="normal"
            required
          >
            {perchas.map((percha) => (
              <MenuItem key={percha.id} value={percha.id}>
                {percha.nombre}
              </MenuItem>
            ))}
          </TextField>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Agregar
          </Button>
        </Box>
      </Modal>

      {/* Modal para editar producto */}
      <Modal open={editModal} onClose={handleCloseEditModal}>
        <Box sx={style} component="form" onSubmit={handleEditSubmitProducto}>
          <Typography variant="h6" component="h2" gutterBottom>
            Editar Producto
          </Typography>

          <TextField
            label="Nombre del Producto"
            name="nombre"
            fullWidth
            value={editProducto.nombre}
            onChange={handleChange(setEditProducto)}
            margin="normal"
            required
          />
          <TextField
            label="Precio"
            name="precio"
            fullWidth
            value={editProducto.precio}
            onChange={handleChange(setEditProducto)}
            margin="normal"
            required
          />
          <TextField
            label="Cantidad"
            name="cantidad"
            fullWidth
            value={editProducto.cantidad}
            onChange={handleChange(setEditProducto)}
            margin="normal"
            required
          />
          <TextField
            select
            label="Percha Asignada"
            name="id_percha"
            fullWidth
            value={editProducto.id_percha}
            onChange={handleChange(setEditProducto)}
            margin="normal"
            required
          >
            {perchas.map((percha) => (
              <MenuItem key={percha.id} value={percha.id}>
                {percha.nombre}
              </MenuItem>
            ))}
          </TextField>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Guardar Cambios
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default ProductoCrud;
