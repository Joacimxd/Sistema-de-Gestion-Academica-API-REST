const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { authMiddleware, adminRequired, profesorOrAdminRequired } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Alumno:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         usuario_id:
 *           type: integer
 *         matricula:
 *           type: string
 *         carrera:
 *           type: string
 *         semestre:
 *           type: integer
 *         fecha_ingreso:
 *           type: string
 *           format: date
 *         estatus:
 *           type: string
 *           enum: [activo, baja, egresado]
 */

const alumnoSchema = Joi.object({
  usuario_id: Joi.number().integer().required(),
  matricula: Joi.string().required(),
  carrera: Joi.string().required(),
  semestre: Joi.number().integer().min(1).max(10).required(),
  fecha_ingreso: Joi.date().required(),
  estatus: Joi.string().valid('activo', 'baja', 'egresado').default('activo')
});

/**
 * @swagger
 * /api/alumnos:
 *   get:
 *     summary: Obtener todos los alumnos
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alumnos
 */
router.get('/', authMiddleware, profesorOrAdminRequired, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, u.nombre, u.email
      FROM Alumno a
      JOIN Usuario u ON a.usuario_id = u.id
      ORDER BY a.matricula
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
});

/**
 * @swagger
 * /api/alumnos/{id}:
 *   get:
 *     summary: Obtener alumno por ID
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT a.*, u.nombre, u.email, u.activo
      FROM Alumno a
      JOIN Usuario u ON a.usuario_id = u.id
      WHERE a.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    
    // Solo admin, profesores o el mismo alumno pueden ver los datos
    const alumno = result.rows[0];
    if (req.user.rol !== 'admin' && req.user.rol !== 'profesor' && req.user.id !== alumno.usuario_id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    res.json(alumno);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumno' });
  }
});

/**
 * @swagger
 * /api/alumnos:
 *   post:
 *     summary: Crear nuevo alumno
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: integer
 *               matricula:
 *                 type: string
 *               carrera:
 *                 type: string
 *               semestre:
 *                 type: integer
 *               fecha_ingreso:
 *                 type: string
 *                 format: date
 */
router.post('/', authMiddleware, adminRequired, async (req, res) => {
  try {
    const { error, value } = alumnoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { usuario_id, matricula, carrera, semestre, fecha_ingreso, estatus } = value;
    
    // Verificar que el usuario existe y es tipo alumno
    const userCheck = await db.query('SELECT rol FROM Usuario WHERE id = $1', [usuario_id]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    if (userCheck.rows[0].rol !== 'alumno') {
      return res.status(400).json({ error: 'El usuario debe tener rol de alumno' });
    }
    
    // Verificar matricula única
    const existingAlumno = await db.query('SELECT id FROM Alumno WHERE matricula = $1', [matricula]);
    if (existingAlumno.rows.length > 0) {
      return res.status(400).json({ error: 'La matrícula ya está registrada' });
    }
    
    const result = await db.query(`
      INSERT INTO Alumno (usuario_id, matricula, carrera, semestre, fecha_ingreso, estatus)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [usuario_id, matricula, carrera, semestre, fecha_ingreso, estatus || 'activo']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear alumno' });
  }
});

/**
 * @swagger
 * /api/alumnos/{id}:
 *   put:
 *     summary: Actualizar alumno
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateSchema = Joi.object({
      matricula: Joi.string(),
      carrera: Joi.string(),
      semestre: Joi.number().integer().min(1).max(10),
      fecha_ingreso: Joi.date(),
      estatus: Joi.string().valid('activo', 'baja', 'egresado')
    });
    
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(value).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value[key]);
      paramCount++;
    });
    
    values.push(id);
    
    const result = await db.query(`
      UPDATE Alumno SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar alumno' });
  }
});

/**
 * @swagger
 * /api/alumnos/{id}:
 *   delete:
 *     summary: Eliminar alumno
 *     tags: [Alumnos]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, adminRequired, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      DELETE FROM Alumno WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    
    res.json({ message: 'Alumno eliminado correctamente', alumno: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar alumno' });
  }
});

module.exports = router;