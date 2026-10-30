const express = require('express');
const { cerrarSesionAdmin, iniciarSesion } = require('../controllers/admin');
const { requiereAdmin } = require('../middleware/autenticacion');

const router = express.Router();
router.post('/login', iniciarSesion);
router.post('/logout', requiereAdmin, cerrarSesionAdmin);

module.exports = router;
