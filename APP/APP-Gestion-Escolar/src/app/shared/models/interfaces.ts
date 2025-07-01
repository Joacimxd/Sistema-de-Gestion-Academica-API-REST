export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  rol: "admin" | "profesor" | "alumno";
  activo: boolean;
}

export interface Alumno {
  id?: number;
  matricula: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fechaNacimiento: Date;
  activo: boolean;
}

export interface Profesor {
  id?: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  especialidad: string;
  activo: boolean;
}

export interface Materia {
  id?: number;
  nombre: string;
  codigo: string;
  creditos: number;
  descripcion?: string;
  activo: boolean;
}

export interface Grupo {
  id?: number;
  nombre: string;
  materiaId: number;
  profesorId: number;
  capacidad: number;
  horario: string;
  aula: string;
  activo: boolean;
}

export interface Inscripcion {
  id?: number;
  alumnoId: number;
  grupoId: number;
  fechaInscripcion: Date;
  calificacion?: number;
  activo: boolean;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
