const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  correo: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  producto: { type: String, required: true, trim: true },
  productoId: { type: Number },
  cantidad: { type: Number, required: true, min: 1 },
  mensaje: { type: String, default: '', trim: true },
  estado: { type: String, enum: ['Pendiente', 'Listo'], default: 'Pendiente' },
}, { timestamps: true });

module.exports = mongoose.models.Pedido || mongoose.model('Pedido', pedidoSchema);
