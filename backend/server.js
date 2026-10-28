require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('node:crypto');
const path = require('node:path');
require('dotenv').config();

const Producto = require('./models/productos');
const Pedido = require('./models/pedidos');
const app = express();
const sesiones = new Map();
const DURACION_SESION = 8 * 60 * 60 * 1000;

app.use(express.json({ limit: '1mb' }));

function validarHash(contrasena, hashConfigurado) {
  if (!hashConfigurado) return false;
  const [algoritmo, sal, hashGuardado] = hashConfigurado.split('$');
  if (algoritmo !== 'scrypt' || !sal || !hashGuardado) return false;
  const esperado = Buffer.from(hashGuardado, 'hex');
  const recibido = crypto.scryptSync(contrasena, sal, esperado.length);
  return esperado.length === recibido.length && crypto.timingSafeEqual(esperado, recibido);
}

function requiereAdmin(req, res, next) {
  const token = req.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const sesion = token && sesiones.get(token);
  if (!sesion || sesion.expira < Date.now()) {
    if (token) sesiones.delete(token);
    return res.status(401).json({ error: 'Inicia sesión para continuar.' });
  }
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado' });
});

app.post('/api/admin/login', (req, res) => {
  const correo = String(req.body?.correo || '').trim().toLowerCase();
  const contrasena = String(req.body?.contrasena || '');
  const correoAdmin = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!correoAdmin || correo !== correoAdmin || !validarHash(contrasena, process.env.ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({ error: 'El correo o la contraseña no son correctos.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  sesiones.set(token, { expira: Date.now() + DURACION_SESION });
  res.json({ token, correo: correoAdmin });
});

app.post('/api/admin/logout', requiereAdmin, (req, res) => {
  const token = req.get('Authorization').replace(/^Bearer\s+/i, '');
  sesiones.delete(token);
  res.json({ mensaje: 'Sesión cerrada.' });
});

app.get('/api/productos', async (req, res) => {
  try {
    res.json(await Producto.find().sort({ id: 1 }).lean());
  } catch (error) {
    res.status(503).json({ error: 'No se pudieron cargar los productos. Revisa la conexión con MongoDB.' });
  }
});

app.post('/api/productos', requiereAdmin, async (req, res) => {
  const { nombre, categoria, precio, descripcion, imagen = '', destacado = false } = req.body || {};
  if (!String(nombre || '').trim() || !['Kombucha', 'Kéfir'].includes(categoria) || !Number.isFinite(Number(precio)) || Number(precio) < 0 || !String(descripcion || '').trim()) {
    return res.status(400).json({ error: 'Completa nombre, categoría, precio y descripción.' });
  }
  try {
    const ultimo = await Producto.findOne().sort({ id: -1 }).select('id').lean();
    const producto = await Producto.create({
      id: (ultimo?.id || 0) + 1,
      nombre: String(nombre).trim(),
      categoria,
      precio: Number(precio),
      descripcion: String(descripcion).trim(),
      imagen: String(imagen).trim(),
      destacado: Boolean(destacado),
    });
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar el producto.' });
  }
});

app.delete('/api/productos/:id', requiereAdmin, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ error: 'No se encontró el producto.' });
    res.json({ mensaje: 'Producto eliminado.' });
  } catch (error) {
    res.status(400).json({ error: 'No se pudo eliminar el producto.' });
  }
});

app.post('/api/pedidos', async (req, res) => {
  const { nombre, correo, telefono, producto, productoId, cantidad, mensaje = '' } = req.body || {};
  if (!String(nombre || '').trim() || !String(correo || '').trim() || !String(telefono || '').trim() || !String(producto || '').trim() || !Number.isInteger(Number(cantidad)) || Number(cantidad) < 1) {
    return res.status(400).json({ error: 'Completa tus datos y el producto que quieres pedir.' });
  }
  try {
    const pedido = await Pedido.create({
      nombre: String(nombre).trim(),
      correo: String(correo).trim(),
      telefono: String(telefono).trim(),
      producto: String(producto).trim(),
      productoId: Number(productoId) || undefined,
      cantidad: Number(cantidad),
      mensaje: String(mensaje).trim(),
    });
    res.status(201).json({ mensaje: 'Tu pedido quedó registrado.', pedidoId: pedido.id });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo registrar el pedido.' });
  }
});

app.get('/api/pedidos', requiereAdmin, async (req, res) => {
  try {
    res.json(await Pedido.find().sort({ createdAt: -1 }).lean());
  } catch (error) {
    res.status(503).json({ error: 'No se pudieron cargar los pedidos.' });
  }
});

app.patch('/api/pedidos/:id/listo', requiereAdmin, async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'No se encontró el pedido.' });
    res.json({ mensaje: 'Pedido marcado como listo y retirado de la lista.' });
  } catch (error) {
    res.status(400).json({ error: 'No se pudo actualizar el pedido.' });
  }
});

const carpetaFrontend = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(carpetaFrontend));
app.get(/^(?!\/api\/).*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(carpetaFrontend, 'index.html'), (error) => error && next(error));
});

async function iniciar() {
  const puerto = Number(process.env.PORT) || 3000;
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      console.log('MongoDB conectado.');
      if (await Producto.countDocuments() === 0) {
        const productosIniciales = require('./productos.json');
        if (productosIniciales.length) await Producto.insertMany(productosIniciales);
        console.log('Catálogo inicial cargado.');
      }
    } catch (error) {
      console.error(`MongoDB no está disponible: ${error.message}`);
    }
  } else {
    console.warn('Falta MONGODB_URI en backend/.env.');
  }
  app.listen(puerto, () => console.log(`Kombechi está en http://localhost:${puerto}`));
}

iniciar();


