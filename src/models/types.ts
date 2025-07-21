export interface Becario {
  id: number;
  legajo: string;
  apellido: string;
  nombre: string;
  dni: string;
  nroMovil: string;
  usuarioTelegram: string;
  email: string;
  anioCurso: string;
  areaInscripcion: string;
  beca: string;
}


export interface Profesor {
  id: number;
  apellido: string;
  nombre: string;
  email: string;
  areaAsignada: string;
}