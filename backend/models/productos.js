const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true, trim: true },
  categoria: { type: String, required: true, enum: ['Kombucha', 'Kéfir'] },
  precio: { type: Number, required: true, min: 0 },
  descripcion: { type: String, required: true, trim: true },
  imagen: { type: String, default: '' },
  destacado: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Producto || mongoose.model('Producto', productoSchema);
