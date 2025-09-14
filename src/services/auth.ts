import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from "firebase/auth";
import { auth } from "../firebase";

export type AuthUser = User | null;

/**
 * Inicia sesión con email y contraseña.
 * Lanza la excepción original de Firebase (capturar y mostrar mensaje en UI).
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  // Firebase lanza errores con códigos (`auth/wrong-password`, `auth/user-not-found`, etc.)
  return await signInWithEmailAndPassword(auth, email, password);
}

/** Cierra la sesión del usuario actual */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Observador de estado de autenticación.
 * Retorna la función unsubscribe que debes llamar al desmontar (por ejemplo en useEffect).
 */
export function onAuthChange(callback: (user: AuthUser) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}