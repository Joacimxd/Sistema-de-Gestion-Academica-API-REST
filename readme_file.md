# Sistema de Gestión Académica - API RESTful

API RESTful desarrollada con Node.js, Express.js y PostgreSQL para la gestión de un sistema académico universitario.

## Características

- **CRUD completo** para todas las entidades (Usuarios, Alumnos, Profesores, Materias, Grupos, Inscripciones)
- **Autenticación JWT** con roles de usuario
- **Documentación Swagger** interactiva
- **Validación de datos** con Joi
- **Seguridad** con Helmet y CORS
- **Base de datos PostgreSQL** con relaciones bien definidas

## Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## Instalación

1. **Clonar el repositorio**

   ```bash
   git clone [url-del-repositorio]
   cd sistema-gestion-academica-api
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Crear base de datos**

   ```sql
   CREATE DATABASE sistema_academico;
   ```

5. **Ejecutar script de base de datos**

   ```bash
   psql -U postgres -d sistema_academico -f database/schema.sql
   ```

6. **Iniciar la aplicación**

   ```bash
   # Desarrollo
   npm run dev

   # Producción
   npm start
   ```

## Documentación API

Una vez iniciada la aplicación, la documentación Swagger estará disponible en:

- **URL**: `http://localhost:3000/api-docs`

## Autenticación

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@universidad.edu",
  "password": "password123"
}
```

**Credenciales por defecto:**

- **Admin**: admin@universidad.edu / password123
- **Profesor**: juan.perez@universidad.edu / password123
- **Alumno**: luis.rodriguez@estudiante.edu / password123

### Usar Token

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints Principales

### Usuarios

- `GET /api/usuarios` - Listar usuarios (Admin)
- `GET /api/usuarios/:id` - Obtener usuario específico
- `POST /api/usuarios` - Crear usuario (Admin)
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario (Admin)

### Alumnos

- `GET /api/alumnos` - Listar alumnos
- `GET /api/alumnos/:id` - Obtener alumno específico
- `POST /api/alumnos` - Crear alumno (Admin)
- `PUT /api/alumnos/:id` - Actualizar alumno (Admin)
- `DELETE /api/alumnos/:id` - Eliminar alumno (Admin)

### Profesores

- `GET /api/profesores` - Listar profesores
- `GET /api/profesores/:id` - Obtener profesor específico
- `POST /api/profesores` - Crear profesor (Admin)
- `PUT /api/profesores/:id` - Actualizar profesor (Admin)
- `DELETE /api/profesores/:id` - Eliminar profesor (Admin)

### Materias

- `GET /api/materias` - Listar materias
- `GET /api/materias/:id` - Obtener materia específica
- `POST /api/materias` - Crear materia (Admin)
- `PUT /api/materias/:id` - Actualizar materia (Admin)
- `DELETE /api/materias/:id` - Eliminar materia (Admin)

### Grupos

- `GET /api/grupos` - Listar grupos
- `GET /api/grupos/:id` - Obtener grupo específico
- `POST /api/grupos` - Crear grupo (Admin/Profesor)
- `PUT /api/grupos/:id` - Actualizar grupo (Admin/Profesor)
- `DELETE /api/grupos/:id` - Eliminar grupo (Admin)

### Inscripciones

- `GET /api/inscripciones` - Listar inscripciones
- `GET /api/inscripciones/:id` - Obtener inscripción específica
- `POST /api/inscripciones` - Crear inscripción
- `PUT /api/inscripciones/:id` - Actualizar inscripción
- `DELETE /api/inscripciones/:id` - Eliminar inscripción

## Estructura de la Base de Datos

### Entidades Principales:

- **Usuario**: Información base de usuarios del sistema
- **Alumno**: Datos específicos de estudiantes
- **Profesor**: Información de profesores
- **Materia**: Catálogo de materias
- **Grupo**: Grupos de clase por materia y periodo
- **Inscripcion**: Relación alumno-grupo con calificaciones

## Pruebas con Postman/Insomnia

### Colección de Pruebas Básicas:

1. **Autenticación**

   ```http
   POST /api/auth/login
   ```

2. **Crear Usuario**

   ```http
   POST /api/usuarios
   Authorization: Bearer TOKEN
   ```

3. **Listar Alumnos**

   ```http
   GET /api/alumnos
   Authorization: Bearer TOKEN
   ```

4. **Inscribir Alumno**
   ```http
   POST /api/inscripciones
   Authorization: Bearer TOKEN
   ```

## Roles y Permisos

- **Admin**: Acceso completo a todas las funcionalidades
- **Profesor**: Puede ver alumnos, gestionar grupos y calificaciones
- **Alumno**: Puede ver su información y inscripciones

## Estructura del Proyecto

```
src/
├── config/
│   └── database.js          # Configuración de PostgreSQL
├── middleware/
│   └── auth.js              # Middleware de autenticación
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── usuarios.js          # CRUD de usuarios
│   ├── alumnos.js           # CRUD de alumnos
│   ├── profesores.js        # CRUD de profesores
│   ├── materias.js          # CRUD de materias
│   ├── grupos.js            # CRUD de grupos
│   └── inscripciones.js     # CRUD de inscripciones
├── scripts/
│   └── initDatabase.js      # Script de inicialización
└── app.js                   # Aplicación principal
```

## Estados de Respuesta

- `200` - OK
- `201` - Creado
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `500` - Error interno del servidor

## Desarrollo

### Scripts disponibles:

```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm run init-db  # Inicializar base de datos
```

### Tecnologías utilizadas:

- **Backend**: Node.js, Express.js
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT, bcryptjs
- **Validación**: Joi
- **Documentación**: Swagger/OpenAPI
- **Seguridad**: Helmet, CORS

## Licencia

MIT License - ver archivo LICENSE para más detalles.

## 👥 Contribuidores

- Equipo de Desarrollo - Universidad
