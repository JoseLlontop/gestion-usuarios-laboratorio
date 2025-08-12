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
  Unsubscribe
} from "firebase/firestore";
import { db } from "../firebase";

export interface Area {
  id?: string;
  nombre: string;
  activo?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const areasColl = collection(db, "areas");

/** Crear area (auto-id) */
export async function createArea(data: Omit<Area, "id" | "createdAt" | "updatedAt">) {
  const payload = {
    ...data,
    activo: data.activo ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(areasColl, payload);
  return ref.id;
}

/** Obtener una sola area */
export async function getAreaById(id: string): Promise<Area | null> {
  const ref = doc(db, "areas", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as DocumentData) } as Area;
}

/** Actualizar (patch) */
export async function updateArea(id: string, patch: Partial<Area>) {
  const ref = doc(db, "areas", id);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp()
  } as any);
}

/** Eliminar */
export async function deleteArea(id: string) {
  const ref = doc(db, "areas", id);
  await deleteDoc(ref);
}

/** Suscripción realtime a lista de areas (retorna unsubscribe) */
export function subscribeAreas(callback: (items: Area[]) => void): Unsubscribe {
  const q = query(areasColl, orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap: QuerySnapshot) => {
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as DocumentData) })) as Area[];
    callback(items);
  });
  return unsub;
}

/** Obtener lista una sola vez */
export async function fetchAreasOnce() {
  const snap = await getDocs(query(areasColl, orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as DocumentData) })) as Area[];
}
