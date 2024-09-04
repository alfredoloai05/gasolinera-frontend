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

function DispensadorCrud() {
  const [grupos, setGrupos] = useState([]);
  const [dispensadores, setDispensadores] = useState([]);
  const [lados, setLados] = useState([]);
  const [mangueras, setMangueras] = useState([]);

  const [availableGrupos, setAvailableGrupos] = useState([]);
  const [availableDispensadores, setAvailableDispensadores] = useState([]);
  const [availableLados, setAvailableLados] = useState([]);

  const [openModal, setOpenModal] = useState({ grupo: false, dispensador: false, lado: false, manguera: false });
  const [editModal, setEditModal] = useState({ grupo: false, dispensador: false, lado: false, manguera: false });

  const [newGrupo, setNewGrupo] = useState({ nombre: "", estado: "true" });
  const [newDispensador, setNewDispensador] = useState({ nombre: "", id_grupo: "" });
  const [newLado, setNewLado] = useState({ nombre: "", id_dispensador: "" });
  const [newManguera, setNewManguera] = useState({ nombre: "", tipo_combustible: "", id_lado: "" });

  const [editGrupo, setEditGrupo] = useState({});
  const [editDispensador, setEditDispensador] = useState({});
  const [editLado, setEditLado] = useState({});
  const [editManguera, setEditManguera] = useState({});

  // Fetch data for all entities
  const fetchData = async () => {
    try {
      const [gruposRes, dispensadoresRes, ladosRes, manguerasRes] = await Promise.all([
        axios.get("http://localhost:5000/grupos", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get("http://localhost:5000/dispensadores", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get("http://localhost:5000/lados", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get("http://localhost:5000/mangueras", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
      ]);
      setGrupos(gruposRes.data);
      setDispensadores(dispensadoresRes.data);
      setLados(ladosRes.data);
      setMangueras(manguerasRes.data);
      setAvailableGrupos(gruposRes.data); // Save available groups
      setAvailableDispensadores(dispensadoresRes.data); // Save available dispensers
      setAvailableLados(ladosRes.data); // Save available sides
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open/Close Modals
  const handleOpenModal = (type) => setOpenModal({ ...openModal, [type]: true });
  const handleCloseModal = (type) => setOpenModal({ ...openModal, [type]: false });

  const handleOpenEditModal = (type, data) => {
    switch (type) {
      case "grupo":
        setEditGrupo(data);
        break;
      case "dispensador":
        setEditDispensador(data);
        break;
      case "lado":
        setEditLado(data);
        break;
      case "manguera":
        setEditManguera(data);
        break;
      default:
        break;
    }
    setEditModal({ ...editModal, [type]: true });
  };
  const handleCloseEditModal = (type) => setEditModal({ ...editModal, [type]: false });

  // Handle Input Change
  const handleChange = (setter) => (e) => setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Submit Functions for Creation
  const handleSubmit = async (e, type) => {
    e.preventDefault();
    let url, data;
    switch (type) {
      case "grupo":
        url = "http://localhost:5000/grupo";
        data = newGrupo;
        break;
      case "dispensador":
        url = "http://localhost:5000/dispensador";
        data = newDispensador;
        break;
      case "lado":
        url = "http://localhost:5000/lado";
        data = newLado;
        break;
      case "manguera":
        url = "http://localhost:5000/manguera";
        data = newManguera;
        break;
      default:
        return;
    }
    try {
      await axios.post(url, data, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      fetchData();
      handleCloseModal(type);
    } catch (error) {
      console.error(`Error al crear ${type}`, error);
    }
  };

  // Submit Functions for Update
  const handleUpdate = async (e, type) => {
    e.preventDefault();
    let url, data, id;
    switch (type) {
      case "grupo":
        id = editGrupo.id;
        url = `http://localhost:5000/grupo/${id}`;
        data = editGrupo;
        break;
      case "dispensador":
        id = editDispensador.id;
        url = `http://localhost:5000/dispensador/${id}`;
        data = editDispensador;
        break;
      case "lado":
        id = editLado.id;
        url = `http://localhost:5000/lado/${id}`;
        data = editLado;
        break;
      case "manguera":
        id = editManguera.id;
        url = `http://localhost:5000/manguera/${id}`;
        data = editManguera;
        break;
      default:
        return;
    }
    try {
      await axios.put(url, data, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      fetchData();
      handleCloseEditModal(type);
    } catch (error) {
      console.error(`Error al actualizar ${type}`, error);
    }
  };

  // Render Modal Form
  const renderForm = (type, data, handleSubmit, handleChange) => (
    <Box sx={style} component="form" onSubmit={(e) => handleSubmit(e, type)}>
      <Typography variant="h6" component="h2" gutterBottom>
        {type === "grupo" ? "Grupo" : type === "dispensador" ? "Dispensador" : type === "lado" ? "Lado" : "Manguera"}
      </Typography>
      <TextField
        label={`Nombre del ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        name="nombre"
        fullWidth
        value={data.nombre}
        onChange={handleChange}
        margin="normal"
        required
      />
      {type === "grupo" && (
        <TextField
          select
          label="Estado"
          name="estado"
          fullWidth
          value={data.estado}
          onChange={handleChange}
          margin="normal"
          required
        >
          <MenuItem value={true}>Disponible</MenuItem>
          <MenuItem value={false}>Ocupado</MenuItem>
        </TextField>
      )}
      {(type === "dispensador" || type === "lado" || type === "manguera") && (
        <TextField
          select
          label={`${type === "dispensador" ? "Grupo" : type === "lado" ? "Dispensador" : "Lado"} Asignado`}
          name={`id_${type === "dispensador" ? "grupo" : type === "lado" ? "dispensador" : "lado"}`}
          fullWidth
          value={data[`id_${type === "dispensador" ? "grupo" : type === "lado" ? "dispensador" : "lado"}`]}
          onChange={handleChange}
          margin="normal"
          required
        >
          {(type === "dispensador" ? availableGrupos : type === "lado" ? availableDispensadores : availableLados).map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.nombre}
            </MenuItem>
          ))}
        </TextField>
      )}
      {type === "manguera" && (
        <TextField
          label="Tipo de Combustible"
          name="tipo_combustible"
          fullWidth
          value={data.tipo_combustible}
          onChange={handleChange}
          margin="normal"
          required
        />
      )}
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Guardar Cambios
      </Button>
    </Box>
  );

  return (
    <div>
      {/* CRUD Grupos */}
      <h2>CRUD de Grupos</h2>
      <Fab color="primary" aria-label="add" onClick={() => handleOpenModal("grupo")} style={{ marginBottom: "20px" }}>
        <AddIcon />
      </Fab>
      <CrudTable
        columns={[
          { title: "Nombre del Grupo", field: "nombre" },
          {
            title: "Estado",
            field: "estado",
            render: (rowData) => (rowData.estado ? "Disponible" : "Ocupado"),
          },
        ]}
        data={grupos}
        onEdit={(row) => handleOpenEditModal("grupo", row)}
        onDelete={(row) => console.log("Eliminar grupo", row)}
      />
      <Modal open={openModal.grupo} onClose={() => handleCloseModal("grupo")}>
        {renderForm("grupo", newGrupo, handleSubmit, handleChange(setNewGrupo))}
      </Modal>
      <Modal open={editModal.grupo} onClose={() => handleCloseEditModal("grupo")}>
        {renderForm("grupo", editGrupo, handleUpdate, handleChange(setEditGrupo))}
      </Modal>

      {/* CRUD Dispensadores */}
      <h2>CRUD de Dispensadores</h2>
      <Fab color="primary" aria-label="add" onClick={() => handleOpenModal("dispensador")} style={{ marginBottom: "20px" }}>
        <AddIcon />
      </Fab>
      <CrudTable
        columns={[
          { title: "Nombre del Dispensador", field: "nombre" },
          {
            title: "Grupo Asignado",
            field: "grupo",
            render: (rowData) => (rowData.grupo ? rowData.grupo.nombre : "Sin Grupo"),
          },
        ]}
        data={dispensadores}
        onEdit={(row) => handleOpenEditModal("dispensador", row)}
        onDelete={(row) => console.log("Eliminar dispensador", row)}
      />
      <Modal open={openModal.dispensador} onClose={() => handleCloseModal("dispensador")}>
        {renderForm("dispensador", newDispensador, handleSubmit, handleChange(setNewDispensador))}
      </Modal>
      <Modal open={editModal.dispensador} onClose={() => handleCloseEditModal("dispensador")}>
        {renderForm("dispensador", editDispensador, handleUpdate, handleChange(setEditDispensador))}
      </Modal>

      {/* CRUD Lados */}
      <h2>CRUD de Lados</h2>
      <Fab color="primary" aria-label="add" onClick={() => handleOpenModal("lado")} style={{ marginBottom: "20px" }}>
        <AddIcon />
      </Fab>
      <CrudTable
        columns={[
          { title: "Nombre del Lado", field: "nombre" },
          {
            title: "Dispensador Asignado",
            field: "dispensador",
            render: (rowData) => (rowData.dispensador ? rowData.dispensador.nombre : "Sin Dispensador"),
          },
        ]}
        data={lados}
        onEdit={(row) => handleOpenEditModal("lado", row)}
        onDelete={(row) => console.log("Eliminar lado", row)}
      />
      <Modal open={openModal.lado} onClose={() => handleCloseModal("lado")}>
        {renderForm("lado", newLado, handleSubmit, handleChange(setNewLado))}
      </Modal>
      <Modal open={editModal.lado} onClose={() => handleCloseEditModal("lado")}>
        {renderForm("lado", editLado, handleUpdate, handleChange(setEditLado))}
      </Modal>

      {/* CRUD Mangueras */}
      <h2>CRUD de Mangueras</h2>
      <Fab color="primary" aria-label="add" onClick={() => handleOpenModal("manguera")} style={{ marginBottom: "20px" }}>
        <AddIcon />
      </Fab>
      <CrudTable
        columns={[
          { title: "Nombre de la Manguera", field: "nombre" },
          {
            title: "Lado Asignado",
            field: "lado",
            render: (rowData) => (rowData.lado ? rowData.lado.nombre : "Sin Lado"),
          },
          {
            title: "Tipo de Combustible",
            field: "tipo_combustible",
          },
        ]}
        data={mangueras}
        onEdit={(row) => handleOpenEditModal("manguera", row)}
        onDelete={(row) => console.log("Eliminar manguera", row)}
      />
      <Modal open={openModal.manguera} onClose={() => handleCloseModal("manguera")}>
        {renderForm("manguera", newManguera, handleSubmit, handleChange(setNewManguera))}
      </Modal>
      <Modal open={editModal.manguera} onClose={() => handleCloseEditModal("manguera")}>
        {renderForm("manguera", editManguera, handleUpdate, handleChange(setEditManguera))}
      </Modal>
    </div>
  );
}

export default DispensadorCrud;
