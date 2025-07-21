import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../helpers/axion'; // Axios con withCredentials para cookies HttpOnly
import { Profesor } from '../models/types'; // Importa el tipo Profesor

// Especificamos qué expone el contexto de autenticación
interface AuthContextProps {
  profesor: Profesor | null;       // datos del profesor conectado o null
  error: string | null;            // mensaje de error al iniciar sesión
  login: (email: string, password: string) => Promise<void>;  // función de login
  logout: () => Promise<void>;     // función de logout
}

// Creamos el contexto con valores iniciales (placeholders)
const AuthContext = createContext<AuthContextProps>({
  profesor: null,
  error: null,
  login: async () => {},
  logout: async () => {}
});

// Provider que envuelve la app y gestiona el estado de sesión
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [profesor, setProfesor] = useState<Profesor | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Al cargar la app, comprobamos si hay sesión activa
  useEffect(() => {
    api.get<Profesor>('/api/me')
      .then(res => setProfesor(res.data))
      .catch(() => setProfesor(null));
  }, []);

  // Entra con email y password
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await api.post('/api/login', { email, password });
      const res = await api.get<Profesor>('/api/me');
      setProfesor(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Correo o contraseña incorrectos');
      } else {
        setError('No se pudo conectar al servidor');
      }
      setProfesor(null);
      throw err;
    }
  };

  // Cierra la sesión y pide al backend borrar la cookie
  const logout = async () => {
    await api.post('/api/logout');
    setProfesor(null);
  };

  return (
    <AuthContext.Provider value={{ profesor, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);
