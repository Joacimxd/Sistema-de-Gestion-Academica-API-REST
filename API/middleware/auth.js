const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const result = await db.query(
      'SELECT id, nombre, email, rol, activo FROM Usuario WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    const user = result.rows[0];
    
    if (!user.activo) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Error de autenticación' });
  }
};

const adminRequired = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

const profesorOrAdminRequired = (req, res, next) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'profesor') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de profesor o administrador' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminRequired,
  profesorOrAdminRequired,
  JWT_SECRET
};