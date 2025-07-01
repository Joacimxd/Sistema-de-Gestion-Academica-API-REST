const express = require("express");
const Joi = require("joi");
const db = require("../config/database");
const { authMiddleware, adminRequired } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Grupo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         materia_id:
 *           type: integer
 *         profesor_id:
 *           type: integer
 *         codigo_grupo:
 *           type: string
 *         horario:
 *           type: string
 *         aula:
 *           type: string
 *         cupo_maximo:
 *           type: integer
 *         periodo:
 *           type: string
 *         activo:
 *           type: boolean
 */

const grupoSchema = Joi.object({
  materia_id: Joi.number().integer().required(),
  profesor_id: Joi.number().integer().allow(null),
  codigo_grupo: Joi.string().max(20).required(),
  horario: Joi.string().max(100).allow(""),
  aula: Joi.string().max(50).allow(""),
  cupo_maximo: Joi.number().integer().min(1).default(30),
  periodo: Joi.string().max(20).required(),
  activo: Joi.boolean().default(true),
});

/**
 * @swagger
 * /api/grupos:
 *   get:
 *     summary: Obtener todos los grupos
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Grupo ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener grupos" });
  }
});

/**
 * @swagger
 * /api/grupos/{id}:
 *   get:
 *     summary: Obtener grupo por ID
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM Grupo WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Grupo no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener grupo" });
  }
});

/**
 * @swagger
 * /api/grupos:
 *   post:
 *     summary: Crear nuevo grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { error, value } = grupoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const {
      materia_id,
      profesor_id,
      codigo_grupo,
      horario,
      aula,
      cupo_maximo,
      periodo,
      activo,
    } = value;

    const result = await db.query(
      `INSERT INTO Grupo (materia_id, profesor_id, codigo_grupo, horario, aula, cupo_maximo, periodo, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        materia_id,
        profesor_id,
        codigo_grupo,
        horario,
        aula,
        cupo_maximo,
        periodo,
        activo,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear grupo" });
  }
});

/**
 * @swagger
 * /api/grupos/{id}:
 *   put:
 *     summary: Actualizar grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const updateSchema = grupoSchema.fork(
      Object.keys(grupoSchema.describe().keys),
      (f) => f.optional()
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
      `UPDATE Grupo SET ${fields.join(", ")} WHERE id = $${param} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Grupo no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar grupo" });
  }
});

/**
 * @swagger
 * /api/grupos/{id}:
 *   delete:
 *     summary: Eliminar grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM Grupo WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Grupo no encontrado" });
    }

    res.json({ message: "Grupo eliminado", grupo: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar grupo" });
  }
});

module.exports = router;
