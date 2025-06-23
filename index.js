const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

// Importar rutas
const usuarioRoutes = require("./routes/usuarios");
const profesorRoutes = require("./routes/profesores");
const alumnoRoutes = require("./routes/alumnos");
const materiaRoutes = require("./routes/materias");
const grupoRoutes = require("./routes/grupos");
const inscripcionRoutes = require("./routes/inscripciones");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sistema de Gestión Académica API",
      version: "1.0.0",
      description:
        "API RESTful para el Sistema de Gestión Académica de una universidad",
      contact: {
        name: "Equipo de Desarrollo",
        email: "equipo@universidad.edu",
        url: "https://universidad.edu",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Servidor de desarrollo",
      },
      {
        url: "https://api.universidad.edu/v1",
        description: "Servidor de producción",
      },
    ],
    tags: [
      {
        name: "Autenticación",
        description: "Operaciones relacionadas con autenticación",
      },
      {
        name: "Usuarios",
        description: "Gestión de usuarios del sistema",
      },
      {
        name: "Profesores",
        description: "Gestión de profesores",
      },
      {
        name: "Alumnos",
        description: "Gestión de alumnos",
      },
      {
        name: "Materias",
        description: "Gestión de materias académicas",
      },
      {
        name: "Grupos",
        description: "Gestión de grupos de clase",
      },
      {
        name: "Inscripciones",
        description: "Gestión de inscripciones a materias",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Introduce el token JWT en el formato: Bearer <token>",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Token inválido o no proporcionado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string", example: "No autorizado" },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string", example: "Recurso no encontrado" },
                },
              },
            },
          },
        },
        ValidationError: {
          description: "Error de validación",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string", example: "Error de validación" },
                  details: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/profesores", profesorRoutes);
app.use("/api/alumnos", alumnoRoutes);
app.use("/api/materias", materiaRoutes);
app.use("/api/grupos", grupoRoutes);
app.use("/api/inscripciones", inscripcionRoutes);

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    message: "API Sistema de Gestión Académica",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      auth: "/api/auth",
      usuarios: "/api/usuarios",
      profesores: "/api/profesores",
      alumnos: "/api/alumnos",
      materias: "/api/materias",
      grupos: "/api/grupos",
      inscripciones: "/api/inscripciones",
    },
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Error interno del servidor",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Ha ocurrido un error",
  });
});

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    message: `La ruta ${req.originalUrl} no existe`,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(
    `📚 Documentación disponible en http://localhost:${PORT}/api-docs`
  );
});

module.exports = app;
