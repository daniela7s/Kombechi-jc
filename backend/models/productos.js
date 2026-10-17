const mongoose = require('mongoose');

// datos de cada producto
const ProductoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true },
    categoria: { type: String, required: true },
    precio: { type: Number, required: true },
    descripcion: { type: String, required: true },
    imagen: { type: String, required: false },
    destacado: { type: Boolean, required: true }
}, {
    timestamps: true //agrega fecha crecaion
}); 

module.exports = mongoose.model('Producto', ProductoSchema);
