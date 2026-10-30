const crypto = require('node:crypto');

const sesiones = new Map();
const duracionSesion = 8 * 60 * 60 * 1000;

function requiereAdmin(req, res, next) {
  const token = req.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const sesion = token && sesiones.get(token);
  if (!sesion || sesion.expira < Date.now()) {
    if (token) sesiones.delete(token);
    return res.status(401).json({ error: 'Inicia sesión para continuar.' });
  }
  next();
}

function crearSesion() {
  const token = crypto.randomBytes(32).toString('hex');
  sesiones.set(token, { expira: Date.now() + duracionSesion });
  return token;
}

function cerrarSesion(token) {
  sesiones.delete(token);
}

module.exports = { crearSesion, cerrarSesion, requiereAdmin };
