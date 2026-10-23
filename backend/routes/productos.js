
const express = require('express');
const Producto = require('../models/Producto.js');

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const listaProductos = await Producto.find();
    res.json(listaProductos);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener los productos de la base de datos'
    });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findOne({
      id: Number(req.params.id)
    });

    if (!producto) {
      return res.status(404).json({
        error: 'No encontrado'
      });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({
      error: 'Error al buscar el producto'
    });
  }
});

module.exports = router;
