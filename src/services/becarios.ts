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

export interface Becario {
  id?: string;
  legajo?: string;
  apellido?: string;
  nombre?: string;
  dni?: string;
  nroMovil?: string;
  usuarioTelegram?: string;
  email?: string;
  // <-- aquí: aceptar string o number porque Firestore puede contener cualquiera
  anioCurso?: string | number;

  areaId?: string;  // id del doc en collection "areas"
  areaNombre?: string;  // denormalizado para mostrar

  becaId?: string;  // id del doc en collection "becas"
  becaNombre?: string;  // denormalizado para mostrar

  activo?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const becariosColl = collection(db, "becarios");

/** Crear becario */
export async function createBecario(data: Omit<Becario, "id" | "createdAt" | "updatedAt">) {
  const payload = {
    ...data,
    activo: data.activo ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(becariosColl, payload);
  return ref.id;
}

/** Obtener por id */
export async function getBecarioById(id: string): Promise<Becario | null> {
  const ref = doc(db, "becarios", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as DocumentData) } as Becario;
}

/** Actualizar (patch) */
export async function updateBecario(id: string, patch: Partial<Becario>) {
  const ref = doc(db, "becarios", id);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  } as any);
}

/** Eliminar */
export async function deleteBecario(id: string) {
  const ref = doc(db, "becarios", id);
  await deleteDoc(ref);
}

/** Suscripción realtime a lista de becarios (retorna unsubscribe) */
export function subscribeBecarios(callback: (items: Becario[]) => void): Unsubscribe {
  const q = query(becariosColl, orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap: QuerySnapshot) => {
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as DocumentData) })) as Becario[];
    callback(items);
  });
  return unsub;
}

/** Obtener lista una sola vez */
export async function fetchBecariosOnce() {
  const snap = await getDocs(query(becariosColl, orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as DocumentData) })) as Becario[];
}
