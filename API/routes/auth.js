const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const db = require("../config/database");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             email:
 *               type: string
 *             rol:
 *               type: string
 */

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@universidad.edu"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 */
router.post("/login", async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Buscar usuario por email
    const result = await db.query(
      "SELECT id, nombre, email, password, rol, activo FROM Usuario WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = result.rows[0];

    // Verificar que el usuario esté activo
    if (!user.activo) {
      return res.status(401).json({ error: "Usuario inactivo" });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    console.log(await bcrypt.hash(password, 10));
    console.log(user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Respuesta sin incluir la contraseña
    const userResponse = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    };

    res.json({
      message: "Login exitoso",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 */
router.get(
  "/profile",
  require("../middleware/auth").authMiddleware,
  (req, res) => {
    res.json({
      user: req.user,
    });
  }
);

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Validar token
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido
 */
router.get(
  "/validate",
  require("../middleware/auth").authMiddleware,
  (req, res) => {
    res.json({
      valid: true,
      user: req.user,
    });
  }
);

module.exports = router;
