const express = require('express');
const { actualizarEstadoPedido, crearPedido, listarPedidos } = require('../controllers/pedidos');
const { requiereAdmin } = require('../middleware/autenticacion');

const router = express.Router();
router.post('/', crearPedido);
router.get('/', requiereAdmin, listarPedidos);
router.patch('/:id', requiereAdmin, actualizarEstadoPedido);

module.exports = router;
