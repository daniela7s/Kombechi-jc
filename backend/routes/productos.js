const express = require('express');
const { actualizarProducto, crearProducto, eliminarProducto, listarProductos } = require('../controllers/productos');
const { requiereAdmin } = require('../middleware/autenticacion');

const router = express.Router();
router.get('/', listarProductos);
router.post('/', requiereAdmin, crearProducto);
router.put('/:id', requiereAdmin, actualizarProducto);
router.delete('/:id', requiereAdmin, eliminarProducto);

module.exports = router;
