import React, { useState, useEffect } from "react";
import {
    Fab,
    Modal,
    Box,
    TextField,
    Button,
    Typography,
    Checkbox,
} from "@mui/material";
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

function SriPage() {
    const [pagos, setPagos] = useState([]);
    const [ivaList, setIvaList] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [newPago, setNewPago] = useState({ nombre: "", codigo: "" });
    const [editPago, setEditPago] = useState({ id: "", nombre: "", codigo: "" });

    // Obtener la lista de pagos
    const fetchPagos = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/sripagos`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setPagos(response.data);
        } catch (error) {
            console.error("Error al cargar los pagos", error);
        }
    };

    // Obtener la lista de IVA
    const fetchIva = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/iva`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            console.log(response.data); // Verificar los datos recibidos
            setIvaList(response.data);
        } catch (error) {
            console.error("Error al cargar IVA", error);
        }
    };

    useEffect(() => {
        fetchPagos();
        fetchIva();
    }, []);

    const handleOpenAddModal = () => setOpenAddModal(true);
    const handleCloseAddModal = () => setOpenAddModal(false);
    const handleOpenEditModal = (pago) => {
        setEditPago(pago);
        setOpenEditModal(true);
    };
    const handleCloseEditModal = () => setOpenEditModal(false);

    const handleChange = (e) => {
        setNewPago({ ...newPago, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        setEditPago({ ...editPago, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.apiUrl}/sripagos`, newPago, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchPagos();
            handleCloseAddModal();
            setNewPago({ nombre: "", codigo: "" });
        } catch (error) {
            console.error("Error al crear el pago", error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.apiUrl}/sripagos/${editPago.id}`, editPago, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchPagos();
            handleCloseEditModal();
        } catch (error) {
            console.error("Error al actualizar el pago", error);
        }
    };

    const handleDelete = async (pago) => {
        try {
            await axios.delete(`${config.apiUrl}/sripagos/${pago.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchPagos();
        } catch (error) {
            console.error("Error al eliminar el pago", error);
        }
    };

    // Manejar cambio de estado del IVA
    const handleIvaChange = async (id, currentEstado) => {
        try {
            // Invertir el estado actual
            const newEstado = !currentEstado;

            // Enviar el estado actualizado al servidor
            await axios.put(`${config.apiUrl}/iva/${id}`, { estado: newEstado }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            // Refrescar la lista después de actualizar
            fetchIva(); 
        } catch (error) {
            console.error("Error al actualizar IVA", error);
        }
    };

    return (
        <div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", color: "#4caf50" }}>Sri Pagos</h2>

            <Fab
                color="primary"
                aria-label="add"
                onClick={handleOpenAddModal}
                style={{ marginBottom: "20px", backgroundColor: "#72a7fc" }}
            >
                <AddIcon />
            </Fab>

            <CrudTable
                columns={[
                    { title: "Nombre", field: "nombre" },
                    { title: "Código", field: "codigo" },
                ]}
                data={pagos}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
            />

            {/* Modal para agregar nuevo pago */}
            <Modal open={openAddModal} onClose={handleCloseAddModal} aria-labelledby="modal-modal-title">
                <Box sx={style} component="form" onSubmit={handleSubmit}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom sx={{ fontFamily: "Poppins, sans-serif" }}>
                        Agregar Nuevo Pago
                    </Typography>

                    <TextField
                        label="Nombre"
                        name="nombre"
                        fullWidth
                        value={newPago.nombre}
                        onChange={handleChange}
                        margin="normal"
                        required
                        InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
                    />

                    <TextField
                        label="Código"
                        name="codigo"
                        fullWidth
                        value={newPago.codigo}
                        onChange={handleChange}
                        margin="normal"
                        required
                        InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
                    />

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

            {/* Modal para editar pago */}
            <Modal open={openEditModal} onClose={handleCloseEditModal} aria-labelledby="modal-modal-title">
                <Box sx={style} component="form" onSubmit={handleEditSubmit}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom sx={{ fontFamily: "Poppins, sans-serif" }}>
                        Editar Pago
                    </Typography>

                    <TextField
                        label="Nombre"
                        name="nombre"
                        fullWidth
                        value={editPago.nombre}
                        onChange={handleEditChange}
                        margin="normal"
                        required
                        InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
                    />

                    <TextField
                        label="Código"
                        name="codigo"
                        fullWidth
                        value={editPago.codigo}
                        onChange={handleEditChange}
                        margin="normal"
                        required
                        InputProps={{ sx: { fontFamily: "Poppins, sans-serif" } }}
                    />

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

            <h2 style={{ fontFamily: "Poppins, sans-serif", color: "#4caf50" }}>IVA</h2>
            <div>
                {ivaList.map((iva) => (
                    <div key={iva.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                        <Typography sx={{ fontFamily: "Poppins, sans-serif", marginRight: "10px" }}>
                            {iva.porcentaje}%
                        </Typography>
                        <Checkbox
                            checked={iva.estado}
                            onChange={() => handleIvaChange(iva.id, iva.estado)}
                            disabled={!iva.estado && ivaList.some((i) => i.estado)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SriPage;
