export interface Becario {
  legajo: string;
  apellido: string;
  nombre: string;
  dni: string;
  nroMovil: string;
  usuarioTelegram: string;
  email: string;
  anioCurso: string;
  areaInscripcion: string; // guardamos nombre visible del área en la UI
  beca: string;            // guardamos nombre visible de la beca en la UI
}

export interface Profesor {
  id: number;
  apellido: string;
  nombre: string;
  email: string;
  areaAsignada: string;
}