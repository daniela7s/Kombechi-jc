const crypto = require('node:crypto');
const { crearSesion, cerrarSesion } = require('../middleware/autenticacion');

function validarHash(contrasena, hashConfigurado) {
  if (!hashConfigurado) return false;
  const [algoritmo, sal, hashGuardado] = hashConfigurado.split('$');
  if (algoritmo !== 'scrypt' || !sal || !hashGuardado) return false;
  const esperado = Buffer.from(hashGuardado, 'hex');
  const recibido = crypto.scryptSync(contrasena, sal, esperado.length);
  return esperado.length === recibido.length && crypto.timingSafeEqual(esperado, recibido);
}

function iniciarSesion(req, res) {
  const correo = String(req.body?.correo || '').trim().toLowerCase();
  const contrasena = String(req.body?.contrasena || '');
  const correoAdmin = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();

  if (!correoAdmin || correo !== correoAdmin || !validarHash(contrasena, process.env.ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({ error: 'El correo o la contraseña no son correctos.' });
  }
  res.json({ token: crearSesion(), correo: correoAdmin });
}

function cerrarSesionAdmin(req, res) {
  const token = req.get('Authorization')?.replace(/^Bearer\s+/i, '');
  cerrarSesion(token);
  res.json({ mensaje: 'Sesión cerrada.' });
}

module.exports = { iniciarSesion, cerrarSesionAdmin };
