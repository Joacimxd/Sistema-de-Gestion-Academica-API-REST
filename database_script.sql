-- Crear base de datos
-- CREATE DATABASE sistema_academico;

-- Usar la base de datos
-- \c sistema_academico;

-- Tabla Usuario
CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('admin', 'profesor', 'alumno')) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Profesor
CREATE TABLE Profesor (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    codigo_empleado VARCHAR(20) UNIQUE NOT NULL,
    departamento VARCHAR(100),
    especialidad VARCHAR(100),
    telefono VARCHAR(15),
    fecha_ingreso DATE
);

-- Tabla Alumno
CREATE TABLE Alumno (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    carrera VARCHAR(100) NOT NULL,
    semestre INTEGER CHECK (semestre >= 1 AND semestre <= 10),
    fecha_ingreso DATE,
    estatus VARCHAR(20) DEFAULT 'activo' CHECK (estatus IN ('activo', 'baja', 'egresado'))
);

-- Tabla Materia
CREATE TABLE Materia (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    creditos INTEGER CHECK (creditos > 0),
    descripcion TEXT,
    prerequisitos TEXT,
    semestre_recomendado INTEGER
);

-- Tabla Grupo
CREATE TABLE Grupo (
    id SERIAL PRIMARY KEY,
    materia_id INTEGER REFERENCES Materia(id) ON DELETE CASCADE,
    profesor_id INTEGER REFERENCES Profesor(id) ON DELETE SET NULL,
    codigo_grupo VARCHAR(20) NOT NULL,
    horario VARCHAR(100),
    aula VARCHAR(50),
    cupo_maximo INTEGER DEFAULT 30,
    periodo VARCHAR(20) NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- Tabla Inscripcion
CREATE TABLE Inscripcion (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER REFERENCES Alumno(id) ON DELETE CASCADE,
    grupo_id INTEGER REFERENCES Grupo(id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calificacion DECIMAL(4,2) CHECK (calificacion >= 0 AND calificacion <= 100),
    estatus VARCHAR(20) DEFAULT 'inscrito' CHECK (estatus IN ('inscrito', 'aprobado', 'reprobado', 'baja')),
    UNIQUE(alumno_id, grupo_id)
);

-- Insertar datos de prueba

-- Usuarios
INSERT INTO Usuario (nombre, email, password, rol) VALUES
('Admin Sistema', 'admin@universidad.edu', '$2a$10$/QMb8BxA/8emiHOiP8a7x.CdHgZ6XwEmMLhWe.fH16VBO9kWJFO1y', 'admin'),
('Dr. Juan Pérez', 'juan.perez@universidad.edu', '$2b$10$rOzWKWxvZrJuHvFqLqJrKOXDUHwgmGxqQ4rXjFmYGJ7KnWz5YMeVa', 'profesor'),
('Dra. María García', 'maria.garcia@universidad.edu', '$2b$10$rOzWKWxvZrJuHvFqLqJrKOXDUHwgmGxqQ4rXjFmYGJ7KnWz5YMeVa', 'profesor'),
('Ing. Carlos López', 'carlos.lopez@universidad.edu', '$2b$10$rOzWKWxvZrJuHvFqLqJrKOXDUHwgmGxqQ4rXjFmYGJ7KnWz5YMeVa', 'profesor'),
('Dra. Ana Martínez', 'ana.martinez@universidad.edu', '$2b$10$rOzWKWxvZrJuHvFqLqJrKOXDUHwgmGxqQ4rXjFmYGJ7KnWz5YMeVa', 'profesor'),
('Luis Rodríguez', 'luis.rodriguez@estudiante.edu', '$2b$10$rOzWKWxvZrJuHvFqLqJrKOXDUHwgmGxqQ4rXjFmYGJ7KnWz5YMeVa', 'alumno'),
('Sofia Hernández', 'sofia.hernandez@estudiante.edu', '$2b$10$rOzWKWxvZrJuHvFqLqJrKOXDUHwgmGxqQ4rXjFmYGJ7KnWz5YMeVa', 'alumno'),
('Diego Torres', 'diego.torres@estudiante.edu', '$2b$10$rOzWKWxvZrJuHvFqLqJrKOXDUHwgmGxqQ4rXjFmYGJ7KnWz5YMeVa', 'alumno'),
('Daniela Morales', 'daniela.morales@estudiante.edu', '$2b$10$rOzWKWxvZrJuHvFqLqJrKOXDUHwgmGxqQ4rXjFmYGJ7KnWz5YMeVa', 'alumno'),
('Roberto Jiménez', 'roberto.jimenez@estudiante.edu', '$2b$10$rOzWKWxvZrJuHvFqLqJrKOXDUHwgmGxqQ4rXjFmYGJ7KnWz5YMeVa', 'alumno');

-- Profesores
INSERT INTO Profesor (usuario_id, codigo_empleado, departamento, especialidad, telefono, fecha_ingreso) VALUES
(2, 'PROF001', 'Ingeniería de Software', 'Desarrollo Web', '555-0101', '2020-01-15'),
(3, 'PROF002', 'Matemáticas', 'Análisis Matemático', '555-0102', '2019-08-20'),
(4, 'PROF003', 'Ciencias Computacionales', 'Bases de Datos', '555-0103', '2021-03-10'),
(5, 'PROF004', 'Ingeniería de Software', 'Arquitectura de Software', '555-0104', '2018-11-05');

-- Alumnos
INSERT INTO Alumno (usuario_id, matricula, carrera, semestre, fecha_ingreso, estatus) VALUES
(6, 'A2023001', 'Ingeniería en Sistemas Computacionales', 5, '2023-08-15', 'activo'),
(7, 'A2023002', 'Ingeniería en Software', 3, '2023-08-15', 'activo'),
(8, 'A2022001', 'Ingeniería en Sistemas Computacionales', 7, '2022-08-20', 'activo'),
(9, 'A2023003', 'Ingeniería en Software', 4, '2023-08-15', 'activo'),
(10, 'A2022002', 'Licenciatura en Matemáticas', 6, '2022-08-20', 'activo');

-- Materias
INSERT INTO Materia (codigo, nombre, creditos, descripcion, prerequisitos, semestre_recomendado) VALUES
('ISC501', 'Desarrollo Web Avanzado', 6, 'Curso avanzado de desarrollo web con tecnologías modernas', 'Programación Web Básica', 5),
('MAT301', 'Cálculo Diferencial', 8, 'Fundamentos del cálculo diferencial', 'Álgebra Superior', 3),
('ISC401', 'Base de Datos', 6, 'Diseño e implementación de bases de datos', 'Estructura de Datos', 4),
('ISC601', 'Arquitectura de Software', 6, 'Patrones y principios de arquitectura de software', 'Ingeniería de Software', 6),
('ISC301', 'Programación Orientada a Objetos', 6, 'Paradigma de programación orientada a objetos', 'Fundamentos de Programación', 3);

-- Grupos
INSERT INTO Grupo (materia_id, profesor_id, codigo_grupo, horario, aula, cupo_maximo, periodo, activo) VALUES
(1, 1, 'ISC501-A', 'Lunes y Miércoles 10:00-12:00', 'LAB-A', 25, '2024-2', true),
(2, 2, 'MAT301-A', 'Martes y Jueves 08:00-10:00', 'AULA-101', 30, '2024-2', true),
(3, 3, 'ISC401-A', 'Lunes, Miércoles y Viernes 14:00-15:00', 'LAB-B', 20, '2024-2', true),
(4, 4, 'ISC601-A', 'Martes y Jueves 16:00-18:00', 'AULA-201', 25, '2024-2', true),
(5, 1, 'ISC301-A', 'Lunes y Miércoles 08:00-10:00', 'LAB-C', 30, '2024-2', true),
(1, 1, 'ISC501-B', 'Martes y Jueves 14:00-16:00', 'LAB-A', 25, '2024-2', true),
(2, 2, 'MAT301-B', 'Lunes y Miércoles 16:00-18:00', 'AULA-102', 30, '2024-2', true),
(3, 3, 'ISC401-B', 'Martes y Jueves 10:00-12:00', 'LAB-B', 20, '2024-2', true),
(4, 4, 'ISC601-B', 'Viernes 08:00-12:00', 'AULA-202', 25, '2024-2', true),
(5, 1, 'ISC301-B', 'Viernes 14:00-18:00', 'LAB-C', 30, '2024-2', true);

-- Inscripciones
INSERT INTO Inscripcion (alumno_id, grupo_id, fecha_inscripcion, calificacion, estatus) VALUES
(1, 1, '2024-08-01 10:00:00', 85.5, 'aprobado'),
(1, 3, '2024-08-01 10:05:00', 92.0, 'aprobado'),
(2, 2, '2024-08-01 11:00:00', 78.5, 'aprobado'),
(2, 5, '2024-08-01 11:05:00', 88.0, 'aprobado'),
(3, 1, '2024-08-01 12:00:00', 90.5, 'aprobado'),
(3, 4, '2024-08-01 12:05:00', NULL, 'inscrito'),
(4, 2, '2024-08-01 13:00:00', 82.0, 'aprobado'),
(4, 4, '2024-08-01 13:05:00', 95.5, 'aprobado'),
(5, 3, '2024-08-01 14:00:00', 87.5, 'aprobado'),
(5, 5, '2024-08-01 14:05:00', NULL, 'inscrito');

-- Crear índices para optimización
CREATE INDEX idx_usuario_email ON Usuario(email);
CREATE INDEX idx_profesor_codigo ON Profesor(codigo_empleado);
CREATE INDEX idx_alumno_matricula ON Alumno(matricula);
CREATE INDEX idx_materia_codigo ON Materia(codigo);
CREATE INDEX idx_inscripcion_alumno ON Inscripcion(alumno_id);
CREATE INDEX idx_inscripcion_grupo ON Inscripcion(grupo_id);