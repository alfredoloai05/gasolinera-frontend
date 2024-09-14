import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const responseAdmin = await axios.post("http://localhost:5000/loginAdm", { usuario, clave });
      const { access_token, role, usuario: nombre } = responseAdmin.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("usuario", nombre);

      if (role === "admin") {
        navigate("/admin");
      }
    } catch (errorAdmin) {
      try {
        const responseOperador = await axios.post("http://localhost:5000/loginOp", { usuario, clave });
        const { access_token, role, usuario: nombre, id } = responseOperador.data;

        localStorage.setItem("token", access_token); 
        localStorage.setItem("role", role);
        localStorage.setItem("usuario", nombre);
        localStorage.setItem("id_operador", id); 

        if (role === "operador") {
          navigate("/operador");
        }
      } catch (errorOperador) {
        setError("Credenciales no válidas para administrador ni operador");
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <Typography variant="h4" gutterBottom>
        Iniciar Sesión
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Clave"
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Iniciar Sesión
        </Button>
      </form>
    </Box>
  );
}

export default Login;
