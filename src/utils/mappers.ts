import { Becario as AppBecario } from "../models/types";
import { Becario as SvcBecario } from "../services/becarios";
import { Area } from "../services/areas";
import { Beca as BecaType } from "../services/becas";

/**
 * Convierte un Becario del modelo UI (AppBecario) al formato que espera el service (SvcBecario).
 * Acepta opcionalmente listas de areas y becas para resolver areaId/areaNombre y becaId/becaNombre.
 * - convierte anioCurso a number si es posible (Number), si no deja el string.
 * - agrega campos denormalizados y activo: true por defecto.
 */
export function mapAppToSvc(
  app: AppBecario,
  areas: Area[] = [],
  becas: BecaType[] = []
): SvcBecario {
  const areaObj = areas.find(a => a.nombre === (app.areaInscripcion ?? ""));
  const becaObj = becas.find(b => b.nombre === (app.beca ?? ""));

  const maybeNum = Number(app.anioCurso);
  const anioField: number | string = Number.isNaN(maybeNum) ? (app.anioCurso ?? "") : maybeNum;

  const svcPartial: Partial<SvcBecario> = {
    legajo: app.legajo ?? "",
    apellido: app.apellido ?? "",
    nombre: app.nombre ?? "",
    dni: app.dni ?? "",
    nroMovil: app.nroMovil ?? "",
    usuarioTelegram: app.usuarioTelegram ?? "",
    email: app.email ?? "",
    anioCurso: anioField,
    activo: true,
    // referencias / denormalizados (si no encuentra id deja undefined)
    areaId: areaObj?.id,
    areaNombre: areaObj?.nombre ?? app.areaInscripcion ?? "",
    becaId: becaObj?.id,
    becaNombre: becaObj?.nombre ?? app.beca ?? "",
    // opcionales (si tu AppBecario tiene createdAt/updatedAt las preservamos)
    createdAt: (app as any).createdAt,
    updatedAt: (app as any).updatedAt,
  };

  return svcPartial as SvcBecario;
}

/**
 * Elimina propiedades con valor undefined de un objeto.
 * Útil antes de persistir a Firestore.
 */
export function removeUndefined<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as T;
}