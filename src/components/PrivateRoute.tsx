import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Ajusta la ruta si es necesario
import { Box, CircularProgress, Typography } from "@mui/material";

const PrivateRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="h6" color="text.secondary">
          Verificando sesión...
        </Typography>
      </Box>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login-profesor" replace />;
};

export default PrivateRoute;