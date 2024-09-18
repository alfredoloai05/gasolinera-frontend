import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminPage from "./pages/AdminPage";
import OperadorPage from "./pages/OperadorPage";

function App() {
  const isLoggedIn = !!localStorage.getItem("token"); // Verifica si el usuario está logueado
  const userRole = localStorage.getItem("role");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? (userRole === "admin" ? <Navigate to="/admin" /> : <Navigate to="/operador" />) : <Login />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/operador" element={<OperadorPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
