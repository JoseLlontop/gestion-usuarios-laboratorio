// src/services/becas.ts
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Beca {
  id?: string;
  nombre: string;
  activo?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const becasColl = collection(db, "becas");

/** Crear beca (auto-id) */
export async function createBeca(data: Omit<Beca, "id" | "createdAt" | "updatedAt">) {
  const payload = {
    ...data,
    activo: data.activo ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(becasColl, payload);
  return ref.id;
}

/** Obtener una sola beca */
export async function getBecaById(id: string): Promise<Beca | null> {
  const ref = doc(db, "becas", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as DocumentData) } as Beca;
}

/** Actualizar (patch) */
export async function updateBeca(id: string, patch: Partial<Beca>) {
  const ref = doc(db, "becas", id);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  } as any);
}

/** Eliminar */
export async function deleteBeca(id: string) {
  const ref = doc(db, "becas", id);
  await deleteDoc(ref);
}

/** Suscripción realtime a lista de becas (retorna unsubscribe) */
export function subscribeBecas(callback: (items: Beca[]) => void): Unsubscribe {
  const q = query(becasColl, orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap: QuerySnapshot) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Beca[];
    callback(items);
  });
  return unsub;
}

/** Obtener lista una sola vez */
export async function fetchBecasOnce() {
  const snap = await getDocs(query(becasColl, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Beca[];
}
