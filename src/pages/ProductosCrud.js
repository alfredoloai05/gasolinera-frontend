import React, { useState, useEffect } from "react";
import { Fab, Modal, Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CrudTable from "../components/CrudTable";
import axios from "axios";
import config from '../config'; 

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #4caf50",
  boxShadow: 24,
  p: 4,
  fontFamily: "Poppins, sans-serif",
};

function ProductoCrud() {
  const [productos, setProductos] = useState([]);
  const [perchas, setPerchas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [newProducto, setNewProducto] = useState({
    ConceptoProducto: "",
    PrecioVentaPublico: "",
    StockActual: "",
    CodigoProducto: "",
    CodigoBarra: "",
    id_percha: "",
  });
  const [editProducto, setEditProducto] = useState({
    ConceptoProducto: "",
    PrecioVentaPublico: "",
    StockActual: "",
    CodigoProducto: "",
    CodigoBarra: "",
    id_percha: "",
  });

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/productos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos", error);
    }
  };

  const fetchPerchas = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/perchas`, {
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

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenEditModal = (producto) => {
    setEditProducto(producto);
    setEditModal(true);
  };
  const handleCloseEditModal = () => setEditModal(false);

  const handleChange = (setter) => (e) => {
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.apiUrl}/producto`, newProducto, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProductos();
      handleCloseModal();
      setNewProducto({
        ConceptoProducto: "",
        PrecioVentaPublico: "",
        StockActual: "",
        CodigoProducto: "",
        CodigoBarra: "",
        id_percha: "",
      });
    } catch (error) {
      console.error("Error al crear producto", error);
    }
  };

  const handleEditSubmitProducto = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.apiUrl}/producto/${editProducto.id}`, editProducto, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProductos();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error al actualizar producto", error);
    }
  };

  const handleDeleteProducto = async (producto) => {
    try {
      await axios.delete(`${config.apiUrl}/producto/${producto.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "Poppins, sans-serif", color: "#4caf50" }}>CRUD de Productos</h2>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenModal}
        style={{ marginBottom: "20px", backgroundColor: "#72a7fc" }}
      >
        <AddIcon />
      </Fab>

      <CrudTable
        columns={[
          { title: "Concepto del Producto", field: "ConceptoProducto" },
          { title: "Precio Venta Público", field: "PrecioVentaPublico" },
          { title: "Stock Actual", field: "StockActual" },
          { title: "Código del Producto", field: "CodigoProducto" },
          { title: "Código de Barra", field: "CodigoBarra" },
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

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={style} component="form" onSubmit={handleSubmitProducto}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: "Poppins, sans-serif" }}>
            Agregar Nuevo Producto
          </Typography>
          <TextField
            label="Concepto del Producto"
            name="ConceptoProducto"
            fullWidth
            value={newProducto.ConceptoProducto}
            onChange={handleChange(setNewProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />
          <TextField
            label="Precio Venta Público"
            name="PrecioVentaPublico"
            fullWidth
            value={newProducto.PrecioVentaPublico}
            onChange={handleChange(setNewProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />
          <TextField
            label="Stock Actual"
            name="StockActual"
            fullWidth
            value={newProducto.StockActual}
            onChange={handleChange(setNewProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />
          <TextField
            label="Código del Producto"
            name="CodigoProducto"
            fullWidth
            value={newProducto.CodigoProducto}
            onChange={handleChange(setNewProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />
          <TextField
            label="Código de Barra"
            name="CodigoBarra"
            fullWidth
            value={newProducto.CodigoBarra}
            onChange={handleChange(setNewProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
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
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          >
            {perchas.map((percha) => (
              <MenuItem key={percha.id} value={percha.id}>
                {percha.nombre}
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontFamily: "Poppins, sans-serif", backgroundColor: "#4caf50" }}
          >
            Agregar
          </Button>
        </Box>
      </Modal>

      <Modal open={editModal} onClose={handleCloseEditModal}>
        <Box sx={style} component="form" onSubmit={handleEditSubmitProducto}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: "Poppins, sans-serif" }}>
            Editar Producto
          </Typography>
          <TextField
            label="Concepto del Producto"
            name="ConceptoProducto"
            fullWidth
            value={editProducto.ConceptoProducto}
            onChange={handleChange(setEditProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />
          <TextField
            label="Precio Venta Público"
            name="PrecioVentaPublico"
            fullWidth
            value={editProducto.PrecioVentaPublico}
            onChange={handleChange(setEditProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />
          <TextField
            label="Stock Actual"
            name="StockActual"
            fullWidth
            value={editProducto.StockActual}
            onChange={handleChange(setEditProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />
          <TextField
            label="Código del Producto"
            name="CodigoProducto"
            fullWidth
            value={editProducto.CodigoProducto}
            onChange={handleChange(setEditProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          />
          <TextField
            label="Código de Barra"
            name="CodigoBarra"
            fullWidth
            value={editProducto.CodigoBarra}
            onChange={handleChange(setEditProducto)}
            margin="normal"
            required
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
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
            InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
          >
            {perchas.map((percha) => (
              <MenuItem key={percha.id} value={percha.id}>
                {percha.nombre}
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontFamily: "Poppins, sans-serif", backgroundColor: "#4caf50" }}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default ProductoCrud;
