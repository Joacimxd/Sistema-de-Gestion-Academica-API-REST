const express = require("express");
const Joi = require("joi");
const db = require("../config/database");
const { authMiddleware, adminRequired } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Inscripcion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         alumno_id:
 *           type: integer
 *         grupo_id:
 *           type: integer
 *         fecha_inscripcion:
 *           type: string
 *           format: date-time
 *         calificacion:
 *           type: number
 *           format: float
 *         estatus:
 *           type: string
 *           enum: [inscrito, aprobado, reprobado, baja]
 */

const inscripcionSchema = Joi.object({
  alumno_id: Joi.number().integer().required(),
  grupo_id: Joi.number().integer().required(),
  calificacion: Joi.number().min(0).max(100).precision(2).optional(),
  estatus: Joi.string()
    .valid("inscrito", "aprobado", "reprobado", "baja")
    .default("inscrito"),
});

/**
 * @swagger
 * /api/inscripciones:
 *   get:
 *     summary: Obtener todas las inscripciones
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Inscripcion ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener inscripciones" });
  }
});

/**
 * @swagger
 * /api/inscripciones/{id}:
 *   get:
 *     summary: Obtener una inscripción por ID
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM Inscripcion WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener inscripción" });
  }
});

/**
 * @swagger
 * /api/inscripciones:
 *   post:
 *     summary: Crear una nueva inscripción
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { error, value } = inscripcionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { alumno_id, grupo_id, calificacion, estatus } = value;

    const result = await db.query(
      `INSERT INTO Inscripcion (alumno_id, grupo_id, calificacion, estatus)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [alumno_id, grupo_id, calificacion || null, estatus]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      res
        .status(409)
        .json({ error: "Ya existe una inscripción para ese alumno y grupo" });
    } else {
      res.status(500).json({ error: "Error al crear inscripción" });
    }
  }
});

/**
 * @swagger
 * /api/inscripciones/{id}:
 *   put:
 *     summary: Actualizar inscripción
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, adminRequired, async (req, res) => {
  try {
    const updateSchema = inscripcionSchema.fork(
      Object.keys(inscripcionSchema.describe().keys),
      (f) => f.optional()
    );
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { id } = req.params;
    const fields = [];
    const values = [];
    let param = 1;

    for (const key in value) {
      fields.push(`${key} = $${param}`);
      values.push(value[key]);
      param++;
    }

    values.push(id);

    const result = await db.query(
      `UPDATE Inscripcion SET ${fields.join(
        ", "
      )} WHERE id = $${param} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar inscripción" });
  }
});

/**
 * @swagger
 * /api/inscripciones/{id}:
 *   delete:
 *     summary: Eliminar inscripción
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM Inscripcion WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inscripción no encontrada" });
    }

    res.json({ message: "Inscripción eliminada", inscripcion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar inscripción" });
  }
});

module.exports = router;
