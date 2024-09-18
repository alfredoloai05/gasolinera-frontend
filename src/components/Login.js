import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, IconButton, InputAdornment, Card, CardContent, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import axios from "axios";
import config from '../config';

function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const responseAdmin = await axios.post(`${config.apiUrl}/loginAdm`, { usuario, clave });
      const { access_token, role, usuario: nombre } = responseAdmin.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("usuario", nombre);

      if (role === "admin") {
        navigate("/admin");
      }
    } catch (errorAdmin) {
      try {
        const responseOperador = await axios.post(`${config.apiUrl}/loginOp`, { usuario, clave });
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

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh" 
      sx={{ 
        fontFamily: 'Poppins, sans-serif', 
        overflow: 'hidden',
        background: 'linear-gradient(-45deg, #e1eec3, #f05053, #41a7a8, #f7b42c)',
        backgroundSize: '400% 400%',
        animation: 'gradientAnimation 15s ease infinite',
        padding: 2 
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400, boxShadow: 6, borderRadius: 2 }}>
        <CardContent>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#2e7d32',
              mb: 2, 
              textAlign: 'center',
              borderBottom: '2px solid #2e7d32',
              pb: 1
            }}
          >
            Iniciar Sesión
          </Typography>
          {error && (
            <Alert 
              severity="error" 
              icon={<WarningAmberIcon fontSize="inherit" />} 
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              label="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              fullWidth
              margin="normal"
              required
              sx={{ 
                backgroundColor: 'white', 
                borderRadius: 1, 
                boxShadow: 3 
              }}
              InputProps={{
                style: { fontFamily: 'Poppins, sans-serif' }
              }}
              InputLabelProps={{
                style: { fontFamily: 'Poppins, sans-serif' }
              }}
            />
            <TextField
              label="Clave"
              type={showPassword ? "text" : "password"}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              fullWidth
              margin="normal"
              required
              sx={{ 
                backgroundColor: 'white', 
                borderRadius: 1, 
                boxShadow: 3 
              }}
              InputProps={{
                style: { fontFamily: 'Poppins, sans-serif' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                style: { fontFamily: 'Poppins, sans-serif' }
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ 
                mt: 3, 
                backgroundColor: '#4caf50', 
                color: 'white', 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 600,
                padding: '10px 0',
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#388e3c'
                }
              }}
            >
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Agregar animación de fondo */}
      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </Box>
  );
}

export default Login;
