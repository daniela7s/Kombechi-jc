const mongoose = require('mongoose');
const Producto = require('../models/productos');

async function conectarMongo() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Falta configurar MONGODB_URI en backend/.env.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB conectado.');

  const productosIniciales = require('../data/productos.json');
  if (await Producto.countDocuments() === 0) {
    if (productosIniciales.length) await Producto.insertMany(productosIniciales);
    console.log('Catálogo inicial cargado.');
  } else {
    for (const producto of productosIniciales) {
      if (producto.imagen) {
        await Producto.updateOne({ id: producto.id, imagen: '' }, { $set: { imagen: producto.imagen } });
      }
    }
  }

  const imagenesConRutaAbsoluta = await Producto.find({ imagen: /^\// }).select('_id imagen').lean();
  for (const producto of imagenesConRutaAbsoluta) {
    await Producto.updateOne({ _id: producto._id }, { $set: { imagen: producto.imagen.slice(1) } });
  }
}

module.exports = conectarMongo;
