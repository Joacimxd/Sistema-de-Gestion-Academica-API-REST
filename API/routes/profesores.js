const express = require("express");
const Joi = require("joi");
const db = require("../config/database");
const { authMiddleware, adminRequired } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Profesor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         usuario_id:
 *           type: integer
 *         codigo_empleado:
 *           type: string
 *         departamento:
 *           type: string
 *         especialidad:
 *           type: string
 *         telefono:
 *           type: string
 *         fecha_ingreso:
 *           type: string
 *           format: date
 */

const profesorSchema = Joi.object({
  usuario_id: Joi.number().integer().required(),
  codigo_empleado: Joi.string().max(20).required(),
  departamento: Joi.string().max(100).allow(null, ""),
  especialidad: Joi.string().max(100).allow(null, ""),
  telefono: Joi.string().max(15).allow(null, ""),
  fecha_ingreso: Joi.date().required(),
});

/**
 * @swagger
 * /api/profesores:
 *   get:
 *     summary: Obtener todos los profesores
 *     tags: [Profesores]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authMiddleware, adminRequired, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM Profesor ORDER BY fecha_ingreso DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener profesores" });
  }
});

/**
 * @swagger
 * /api/profesores:
 *   post:
 *     summary: Crear nuevo profesor
 *     tags: [Profesores]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { error, value } = profesorSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const {
      usuario_id,
      codigo_empleado,
      departamento,
      especialidad,
      telefono,
      fecha_ingreso,
    } = value;

    const existing = await db.query(
      "SELECT id FROM Profesor WHERE codigo_empleado = $1",
      [codigo_empleado]
    );
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Código de empleado ya registrado" });
    }

    const result = await db.query(
      `
      INSERT INTO Profesor (usuario_id, codigo_empleado, departamento, especialidad, telefono, fecha_ingreso)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [
        usuario_id,
        codigo_empleado,
        departamento,
        especialidad,
        telefono,
        fecha_ingreso,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear profesor" });
  }
});

/**
 * @swagger
 * /api/profesores/{id}:
 *   get:
 *     summary: Obtener profesor por ID
 *     tags: [Profesores]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`SELECT * FROM Profesor WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener profesor" });
  }
});

/**
 * @swagger
 * /api/profesores/{id}:
 *   put:
 *     summary: Actualizar profesor
 *     tags: [Profesores]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const updateSchema = profesorSchema.fork(["usuario_id"], (schema) =>
      schema.optional()
    );
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const key in value) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value[key]);
      paramCount++;
    }

    values.push(id); // last parameter

    const result = await db.query(
      `
      UPDATE Profesor SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar profesor" });
  }
});

/**
 * @swagger
 * /api/profesores/{id}:
 *   delete:
 *     summary: Eliminar profesor
 *     tags: [Profesores]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM Profesor WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    res.json({
      message: "Profesor eliminado correctamente",
      profesor: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar profesor" });
  }
});

module.exports = router;
