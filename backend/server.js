require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');

const conectarMongo = require('./config/conexion');
const rutasAdmin = require('./routes/admin');
const rutasPedidos = require('./routes/pedidos');
const rutasProductos = require('./routes/productos');

const app = express();
const origenesPermitidos = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL || '').split(',').map((url) => url.trim()).filter(Boolean),
]);

app.use(cors({
  origin(origen, callback) {
    if (!origen || origenesPermitidos.has(origen)) return callback(null, true);
    return callback(new Error('Este sitio no está autorizado para conectarse con Kombechi.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  const mongodb = mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado';
  res.status(mongodb === 'conectado' ? 200 : 503).json({ estado: mongodb === 'conectado' ? 'ok' : 'error', mongodb });
});
app.use('/api/admin', rutasAdmin);
app.use('/api/productos', rutasProductos);
app.use('/api/pedidos', rutasPedidos);
app.use('/api', (req, res) => {
  res.status(404).json({ error: `La ruta ${req.method} ${req.originalUrl} no existe en la API.` });
});

const carpetaFrontend = path.join(__dirname, '..', 'frontend', 'dist');
const paginaInicio = path.join(carpetaFrontend, 'index.html');
if (fs.existsSync(paginaInicio)) {
  app.use(express.static(carpetaFrontend, {
    setHeaders(res, archivo) {
      if (path.extname(archivo) === '.html') res.setHeader('Cache-Control', 'no-store');
    },
  }));
  app.use('/assets', (req, res) => res.status(404).type('text/plain').send('No se encontró el archivo solicitado.'));
  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(paginaInicio, (error) => error && next(error));
  });
}

async function iniciar() {
  const puerto = Number(process.env.PORT) || 3000;
  try {
    await conectarMongo();
    app.listen(puerto, '0.0.0.0', () => console.log(`Kombechi está disponible en el puerto ${puerto}.`));
  } catch (error) {
    console.error(`No se pudo iniciar Kombechi: ${error.message}`);
    process.exit(1);
  }
}

iniciar();
