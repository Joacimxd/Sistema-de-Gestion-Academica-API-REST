const express = require("express");
const Joi = require("joi");
const db = require("../config/database");
const { authMiddleware, adminRequired } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Materia:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         codigo:
 *           type: string
 *         nombre:
 *           type: string
 *         creditos:
 *           type: integer
 *         descripcion:
 *           type: string
 *         prerequisitos:
 *           type: string
 *         semestre_recomendado:
 *           type: integer
 */

const materiaSchema = Joi.object({
  codigo: Joi.string().max(20).required(),
  nombre: Joi.string().max(100).required(),
  creditos: Joi.number().integer().min(1).required(),
  descripcion: Joi.string().allow(""),
  prerequisitos: Joi.string().allow(""),
  semestre_recomendado: Joi.number().integer().min(1),
});

/**
 * @swagger
 * /api/materias:
 *   get:
 *     summary: Obtener todas las materias
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de materias
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Materia ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener materias" });
  }
});

/**
 * @swagger
 * /api/materias/{id}:
 *   get:
 *     summary: Obtener materia por ID
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM Materia WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener materia" });
  }
});

/**
 * @swagger
 * /api/materias:
 *   post:
 *     summary: Crear una nueva materia
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { error, value } = materiaSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const {
      codigo,
      nombre,
      creditos,
      descripcion,
      prerequisitos,
      semestre_recomendado,
    } = value;

    const result = await db.query(
      `INSERT INTO Materia (codigo, nombre, creditos, descripcion, prerequisitos, semestre_recomendado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        codigo,
        nombre,
        creditos,
        descripcion,
        prerequisitos,
        semestre_recomendado,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear materia" });
  }
});

/**
 * @swagger
 * /api/materias/{id}:
 *   put:
 *     summary: Actualizar materia
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const updateSchema = materiaSchema.fork(
      ["codigo", "nombre", "creditos"],
      (field) => field.optional()
    );
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

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
      `UPDATE Materia SET ${fields.join(
        ", "
      )} WHERE id = $${param} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar materia" });
  }
});

/**
 * @swagger
 * /api/materias/{id}:
 *   delete:
 *     summary: Eliminar materia
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM Materia WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    res.json({ message: "Materia eliminada", materia: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar materia" });
  }
});

module.exports = router;
