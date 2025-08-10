import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { signIn as signInService, logout as logoutService } from "../services/auth";

/** Interfaz del contexto (muy simple) */
interface AuthContextProps {
  user: User | null;
  loading: boolean;            // mientras se inicializa el listener o durante login/logout
  error: string | null;        // último error de login si lo hay
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listener Firebase: mantiene el estado del user actualizado
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Mapeo simple de errores Firebase a mensajes legibles (puedes ampliarlo)
  const firebaseErrorToMessage = (err: any): string => {
    const code: string | undefined = err?.code ?? undefined;
    switch (code) {
      case "auth/wrong-password":
        return "Contraseña incorrecta.";
      case "auth/user-not-found":
        return "No existe una cuenta con ese correo.";
      case "auth/invalid-email":
        return "Correo con formato incorrecto.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Intentá más tarde.";
      case "auth/user-disabled":
        return "Cuenta deshabilitada. Contactá al administrador.";
      default:
        return err?.message ?? "Error al autenticar.";
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInService(email.trim(), password);
      // onAuthStateChanged actualizará `user` cuando el login tenga éxito
    } catch (err: any) {
      const msg = firebaseErrorToMessage(err);
      setError(msg);
      throw err; // lanzar para que la UI también pueda manejar el error si quiere
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutService();
      // onAuthStateChanged actualizará user a null
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);