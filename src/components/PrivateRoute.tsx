import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC = () => {
  const { profesor } = useAuth();
  // <Outlet /> renderiza la ruta hija protegida.
  // Si no hay profesor, redirige a /login-profesor.
  return profesor
    ? <Outlet />
    : <Navigate to="/login-profesor" replace />;
};

export default PrivateRoute;