const express = require("express");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const db = require("../config/database");
const { authMiddleware, adminRequired } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *         rol:
 *           type: string
 *           enum: [admin, profesor, alumno]
 *         activo:
 *           type: boolean
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 */

const usuarioSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rol: Joi.string().valid("admin", "profesor", "alumno").required(),
});

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/", authMiddleware, adminRequired, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, nombre, email, rol, activo, fecha_creacion 
      FROM Usuario 
      ORDER BY fecha_creacion DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.rol !== "admin" && req.user.id != id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const result = await db.query(
      `
      SELECT id, nombre, email, rol, activo, fecha_creacion 
      FROM Usuario 
      WHERE id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 */
router.post("/", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { error, value } = usuarioSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nombre, email, password, rol } = value;

    const existingUser = await db.query(
      "SELECT id FROM Usuario WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
      INSERT INTO Usuario (nombre, email, password, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, email, rol, activo, fecha_creacion
    `,
      [nombre, email, hashedPassword, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.rol !== "admin" && req.user.id != id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const updateSchema = Joi.object({
      nombre: Joi.string().min(2).max(100),
      email: Joi.string().email(),
      password: Joi.string().min(6),
      activo: Joi.boolean(),
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, val] of Object.entries(value)) {
      if (key === "password") {
        fields.push(`${key} = $${paramCount}`);
        values.push(await bcrypt.hash(val, 10));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(val);
      }
      paramCount++;
    }

    values.push(id);

    const result = await db.query(
      `
      UPDATE Usuario SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, nombre, email, rol, activo, fecha_creacion
    `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      DELETE FROM Usuario WHERE id = $1
      RETURNING id, nombre, email
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Usuario eliminado correctamente",
      usuario: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

module.exports = router;
